import { Request, Response } from 'express';
import { OrderService } from '../../application/service/OrderService';
import { OrderMapper } from '../mappers/OrderMapper';
import { NotificationService } from '../../application/service/NotificationService';
import { SessionService } from '../../application/service/SessionService';
import { CustomerInfo } from '../../domain/model/CustomerInfo';
import { Order } from '../../domain/model/Order';

/**
 * OrderController handles HTTP requests related to orders.
 */
export class OrderController {
  private notificationService: NotificationService;
  private sessionService: SessionService;

  constructor(private readonly orderService: OrderService) {
    this.notificationService = NotificationService.getInstance();
    this.sessionService = SessionService.getInstance();
  }

  /**
   * Create a new order
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { customerName, taxNumber, email, items } = req.body;

      if (!customerName || !taxNumber || !email) {
        res.status(400).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('orders.missing_required_fields')
        });
        return;
      }

      // Create the order
      const order = await this.orderService.createOrder(customerName, taxNumber, email);

      // Add order items if they exist
      if (items && Array.isArray(items)) {
        for (const item of items) {
          if (item.productId && item.quantity && item.price) {
            await this.orderService.addOrderItem(
              order.id,
              item.productId,
              parseInt(item.quantity),
              parseFloat(item.price),
              item.currency || 'EUR'
            );
          }
        }
      }

      // Get the user ID from the session
      const userId = this.sessionService.getUserId(req);

      // Send notification to other users
      this.notificationService.notifyOrderChange(userId);

      // Redirect to the orders page
      return this.renderOrdersPage(req, res);
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: error instanceof Error ? error.message : res.__('orders.failed_to_create_order')
      });
    }
  }

  /**
   * Update an existing order
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { customerName, taxNumber, email, items } = req.body;

      if (!customerName || !taxNumber || !email) {
        res.status(400).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('orders.missing_required_fields')
        });
        return;
      }

      // Get the existing order
      const existingOrder = await this.orderService.getOrderById(id);
      if (!existingOrder) {
        res.status(404).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('orders.order_not_found')
        });
        return;
      }

      // Update the order with new customer information
      const updatedOrder = await this.orderService.updateOrder(id, customerName, taxNumber, email);

      if (!updatedOrder) {
        res.status(500).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('orders.failed_to_update_order')
        });
        return;
      }

      // Remove all existing items
      for (const item of updatedOrder.items) {
        await this.orderService.removeOrderItem(updatedOrder.id, item.id.value);
      }

      // Remove all existing items and add new ones
      if (items && Array.isArray(items)) {
        for (const item of items) {
          if (item.productId && item.quantity && item.price) {
            await this.orderService.addOrderItem(
              updatedOrder.id,
              item.productId,
              parseInt(item.quantity),
              parseFloat(item.price),
              item.currency || 'EUR'
            );
          }
        }
      }

      // Get the user ID from the session
      const userId = this.sessionService.getUserId(req);

      // Send notification to other users
      this.notificationService.notifyOrderChange(userId);

      // Redirect to the order details page
      req.params.id = updatedOrder.id;
      return this.renderOrderDetailsPage(req, res);
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: error instanceof Error ? error.message : res.__('orders.failed_to_update_order')
      });
    }
  }

  /**
   * Confirm an order
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async confirmOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.confirmOrder(id);

      if (!order) {
        res.status(404).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('orders.order_not_found')
        });
        return;
      }

      // Get the user ID from the session
      const userId = this.sessionService.getUserId(req);

      // Send notification to other users
      this.notificationService.notifyOrderChange(userId);

      // If the request came from the details page, render the details page
      if (req.headers['hx-current-url']?.toString().includes(`/orders/${id}`)) {
        return this.renderOrderDetailsPage(req, res);
      } else {
        // Copy pagination parameters from body to query if they exist
        if (req.body.page) {
          req.query.page = req.body.page;
        }
        if (req.body.size) {
          req.query.size = req.body.size;
        }
        if (req.body.q) {
          req.query.q = req.body.q;
        }
        // Otherwise render the orders page
        return this.renderOrdersPage(req, res);
      }
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: error instanceof Error ? error.message : res.__('orders.failed_to_confirm_order')
      });
    }
  }

  /**
   * Cancel an order
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.cancelOrder(id);

      if (!order) {
        res.status(404).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('orders.order_not_found')
        });
        return;
      }

      // Get the user ID from the session
      const userId = this.sessionService.getUserId(req);

      // Send notification to other users
      this.notificationService.notifyOrderChange(userId);

      // If the request came from the details page, render the details page
      if (req.headers['hx-current-url']?.toString().includes(`/orders/${id}`)) {
        return this.renderOrderDetailsPage(req, res);
      } else {
        // Copy pagination parameters from body to query if they exist
        if (req.body.page) {
          req.query.page = req.body.page;
        }
        if (req.body.size) {
          req.query.size = req.body.size;
        }
        if (req.body.q) {
          req.query.q = req.body.q;
        }
        // Otherwise render the orders page
        return this.renderOrdersPage(req, res);
      }
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: error instanceof Error ? error.message : res.__('orders.failed_to_cancel_order')
      });
    }
  }

  /**
   * Mark an order as paid
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async markOrderAsPaid(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.markOrderAsPaid(id);

      if (!order) {
        res.status(404).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('orders.order_not_found')
        });
        return;
      }

      // Get the user ID from the session
      const userId = this.sessionService.getUserId(req);

      // Send notification to other users
      this.notificationService.notifyOrderChange(userId);

      // If the request came from the details page, render the details page
      if (req.headers['hx-current-url']?.toString().includes(`/orders/${id}`)) {
        return this.renderOrderDetailsPage(req, res);
      } else {
        // Copy pagination parameters from body to query if they exist
        if (req.body.page) {
          req.query.page = req.body.page;
        }
        if (req.body.size) {
          req.query.size = req.body.size;
        }
        if (req.body.q) {
          req.query.q = req.body.q;
        }
        // Otherwise render the orders page
        return this.renderOrdersPage(req, res);
      }
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: error instanceof Error ? error.message : res.__('orders.failed_to_mark_as_paid')
      });
    }
  }

  /**
   * Start production for an order
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async startOrderProduction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.startOrderProduction(id);

      if (!order) {
        res.status(404).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('orders.order_not_found')
        });
        return;
      }

      // Get the user ID from the session
      const userId = this.sessionService.getUserId(req);

      // Send notification to other users
      this.notificationService.notifyOrderChange(userId);

      // If the request came from the details page, render the details page
      if (req.headers['hx-current-url']?.toString().includes(`/orders/${id}`)) {
        return this.renderOrderDetailsPage(req, res);
      } else {
        // Copy pagination parameters from body to query if they exist
        if (req.body.page) {
          req.query.page = req.body.page;
        }
        if (req.body.size) {
          req.query.size = req.body.size;
        }
        if (req.body.q) {
          req.query.q = req.body.q;
        }
        // Otherwise render the orders page
        return this.renderOrdersPage(req, res);
      }
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: error instanceof Error ? error.message : res.__('orders.failed_to_start_production')
      });
    }
  }

  /**
   * Start delivery for an order
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async startOrderDelivery(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.startOrderDelivery(id);

      if (!order) {
        res.status(404).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('orders.order_not_found')
        });
        return;
      }

      // Get the user ID from the session
      const userId = this.sessionService.getUserId(req);

      // Send notification to other users
      this.notificationService.notifyOrderChange(userId);

      // If the request came from the details page, render the details page
      if (req.headers['hx-current-url']?.toString().includes(`/orders/${id}`)) {
        return this.renderOrderDetailsPage(req, res);
      } else {
        // Copy pagination parameters from body to query if they exist
        if (req.body.page) {
          req.query.page = req.body.page;
        }
        if (req.body.size) {
          req.query.size = req.body.size;
        }
        if (req.body.q) {
          req.query.q = req.body.q;
        }
        // Otherwise render the orders page
        return this.renderOrdersPage(req, res);
      }
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: error instanceof Error ? error.message : res.__('orders.failed_to_start_delivery')
      });
    }
  }

  /**
   * Complete billing for an order
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async completeOrderBilling(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.completeOrderBilling(id);

      if (!order) {
        res.status(404).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('orders.order_not_found')
        });
        return;
      }

      // Get the user ID from the session
      const userId = this.sessionService.getUserId(req);

      // Send notification to other users
      this.notificationService.notifyOrderChange(userId);

      // If the request came from the details page, render the details page
      if (req.headers['hx-current-url']?.toString().includes(`/orders/${id}`)) {
        return this.renderOrderDetailsPage(req, res);
      } else {
        // Copy pagination parameters from body to query if they exist
        if (req.body.page) {
          req.query.page = req.body.page;
        }
        if (req.body.size) {
          req.query.size = req.body.size;
        }
        if (req.body.q) {
          req.query.q = req.body.q;
        }
        // Otherwise render the orders page
        return this.renderOrdersPage(req, res);
      }
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: error instanceof Error ? error.message : res.__('orders.failed_to_complete_billing')
      });
    }
  }

  /**
   * Delete an order
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get the order ID before deleting it
      const orderId = id;

      const deleted = await this.orderService.deleteOrder(id);

      if (!deleted) {
        res.status(404).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('orders.order_not_found')
        });
        return;
      }

      // Get the user ID from the session
      const userId = this.sessionService.getUserId(req);

      // Send notification to other users
      this.notificationService.notifyOrderChange(userId);

      // Copy pagination parameters from body to query if they exist
      if (req.body.page) {
        req.query.page = req.body.page;
      }
      if (req.body.size) {
        req.query.size = req.body.size;
      }
      if (req.body.q) {
        req.query.q = req.body.q;
      }

      // Always redirect to the orders page after delete
      return this.renderOrdersPage(req, res);
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: res.__('orders.failed_to_delete_order')
      });
    }
  }

  /**
   * Render the orders page
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async renderOrdersPage(req: Request, res: Response): Promise<void> {
    try {
      // Get pagination parameters from query
      const size = parseInt(req.query.size as string) || 5; // Default page size is 5
      const page = parseInt(req.query.page as string) || 1; // Default page is 1
      const offset = (page - 1) * size;
      const query = req.query.q as string || ''; // Get search query from request

      // Get paginated orders (with or without search)
      let ordersResult;
      if (query) {
        ordersResult = await this.orderService.searchOrdersWithPagination(query, size, offset);
      } else {
        ordersResult = await this.orderService.getOrdersWithPagination(size, offset);
      }

      const { orders, total } = ordersResult;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDtos = OrderMapper.toDtoList(orders, baseUrl);

      // Calculate pagination info
      const totalPages = Math.ceil(total / size);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      const nextPage = page + 1;
      const prevPage = page - 1;
      const start = total > 0 ? offset + 1 : 0;
      const end = Math.min(offset + size, total);

      // Check if this is an HTMX request for the table container
      const isHtmxRequest = req.headers['hx-request'] === 'true';
      const targetId = req.headers['hx-target'] as string;

      if (isHtmxRequest && (targetId === 'order-table-container' || targetId === '#order-table-container' || targetId === '.card-body')) {
        // If it's an HTMX request for the table container, render only that part
        return res.render('partials/order-table-container', {
          layout: false, // Don't use the layout for the partial
          orders: orderDtos,
          searchQuery: query,
          pagination: {
            currentPage: page,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage,
            prevPage,
            size,
            total,
            start,
            end
          }
        });
      }

      // Otherwise render the full page
      res.render('orders', {
        title: `${res.__('orders.title')} - ${res.__('app.name')}`,
        orders: orderDtos,
        searchQuery: query, // Pass the search query to the view
        pagination: {
          currentPage: page,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage,
          prevPage,
          size,
          total,
          start,
          end
        },
        breadcrumbs: [
          { label: res.__('common.home'), url: '/' },
          { label: res.__('orders.title'), url: '/orders' }
        ]
      });
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: res.__('orders.failed_to_retrieve_orders')
      });
    }
  }

  /**
   * Render the order details page
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async renderOrderDetailsPage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);

      if (!order) {
        res.status(404).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('orders.order_not_found')
        });
        return;
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDto = OrderMapper.toDto(order, baseUrl);

      res.render('order-details', {
        title: `${res.__('orders.order_details')} ${id} - ${res.__('app.name')}`,
        order: orderDto,
        breadcrumbs: [
          { label: res.__('common.home'), url: '/' },
          { label: res.__('orders.title'), url: '/orders' },
          { label: `${id}`, url: `/orders/${id}` }
        ]
      });
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: res.__('orders.failed_to_retrieve_orders')
      });
    }
  }

  /**
   * Render the create order page
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async renderCreateOrderPage(req: Request, res: Response): Promise<void> {
    try {
      res.render('create-order', {
        title: `${res.__('orders.create_new_order')} - ${res.__('app.name')}`,
        isEdit: false,
        breadcrumbs: [
          { label: res.__('common.home'), url: '/' },
          { label: res.__('orders.title'), url: '/orders' },
          { label: res.__('orders.create_new_order'), url: '/orders/create' }
        ]
      });
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: res.__('orders.failed_to_retrieve_orders')
      });
    }
  }

  /**
   * Render the edit order page
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async renderEditOrderPage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);

      if (!order) {
        res.status(404).render('error', {
          title: `${res.__('common.error')} - ${res.__('app.name')}`,
          message: res.__('orders.order_not_found')
        });
        return;
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDto = OrderMapper.toDto(order, baseUrl);

      res.render('create-order', {
        title: `${res.__('orders.edit_order')} - ${res.__('app.name')}`,
        isEdit: true,
        order: orderDto,
        breadcrumbs: [
          { label: res.__('common.home'), url: '/' },
          { label: res.__('orders.title'), url: '/orders' },
          { label: `${id}`, url: `/orders/${id}` },
          { label: res.__('orders.edit_order'), url: `/orders/${id}/edit` }
        ]
      });
    } catch (error) {
      res.status(500).render('error', {
        title: `${res.__('common.error')} - ${res.__('app.name')}`,
        message: res.__('orders.failed_to_retrieve_orders')
      });
    }
  }
}
