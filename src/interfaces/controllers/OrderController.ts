import { Request, Response } from 'express';
import { OrderService } from '../../application/service/OrderService';
import { OrderMapper } from '../mappers/OrderMapper';
import { OrderStatus } from '../../domain/model/OrderStatus';

/**
 * OrderController handles HTTP requests related to orders.
 */
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Create a new order
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { customerName, taxNumber, email } = req.body;

      if (!customerName || !taxNumber || !email) {
        res.status(400).render('error', { 
          title: 'Error - Pogonka',
          message: 'Missing required fields' 
        });
        return;
      }

      const order = await this.orderService.createOrder(customerName, taxNumber, email);

      // Redirect to the orders page
      return this.renderOrdersPage(req, res);
    } catch (error) {
      res.status(500).render('error', { 
        title: 'Error - Pogonka',
        message: error instanceof Error ? error.message : 'Failed to create order' 
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
          title: 'Error - Pogonka',
          message: 'Order not found' 
        });
        return;
      }

      // If the request came from the details page, render the details page
      if (req.headers['hx-current-url']?.toString().includes(`/orders/${id}`)) {
        return this.renderOrderDetailsPage(req, res);
      } else {
        // Otherwise render the orders page
        return this.renderOrdersPage(req, res);
      }
    } catch (error) {
      res.status(500).render('error', { 
        title: 'Error - Pogonka',
        message: error instanceof Error ? error.message : 'Failed to confirm order' 
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
          title: 'Error - Pogonka',
          message: 'Order not found' 
        });
        return;
      }

      // If the request came from the details page, render the details page
      if (req.headers['hx-current-url']?.toString().includes(`/orders/${id}`)) {
        return this.renderOrderDetailsPage(req, res);
      } else {
        // Otherwise render the orders page
        return this.renderOrdersPage(req, res);
      }
    } catch (error) {
      res.status(500).render('error', { 
        title: 'Error - Pogonka',
        message: error instanceof Error ? error.message : 'Failed to cancel order' 
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
          title: 'Error - Pogonka',
          message: 'Order not found' 
        });
        return;
      }

      // If the request came from the details page, render the details page
      if (req.headers['hx-current-url']?.toString().includes(`/orders/${id}`)) {
        return this.renderOrderDetailsPage(req, res);
      } else {
        // Otherwise render the orders page
        return this.renderOrdersPage(req, res);
      }
    } catch (error) {
      res.status(500).render('error', { 
        title: 'Error - Pogonka',
        message: error instanceof Error ? error.message : 'Failed to mark order as paid' 
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
          title: 'Error - Pogonka',
          message: 'Order not found' 
        });
        return;
      }

      // If the request came from the details page, render the details page
      if (req.headers['hx-current-url']?.toString().includes(`/orders/${id}`)) {
        return this.renderOrderDetailsPage(req, res);
      } else {
        // Otherwise render the orders page
        return this.renderOrdersPage(req, res);
      }
    } catch (error) {
      res.status(500).render('error', { 
        title: 'Error - Pogonka',
        message: error instanceof Error ? error.message : 'Failed to start production' 
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
          title: 'Error - Pogonka',
          message: 'Order not found' 
        });
        return;
      }

      // If the request came from the details page, render the details page
      if (req.headers['hx-current-url']?.toString().includes(`/orders/${id}`)) {
        return this.renderOrderDetailsPage(req, res);
      } else {
        // Otherwise render the orders page
        return this.renderOrdersPage(req, res);
      }
    } catch (error) {
      res.status(500).render('error', { 
        title: 'Error - Pogonka',
        message: error instanceof Error ? error.message : 'Failed to start delivery' 
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
          title: 'Error - Pogonka',
          message: 'Order not found' 
        });
        return;
      }

      // If the request came from the details page, render the details page
      if (req.headers['hx-current-url']?.toString().includes(`/orders/${id}`)) {
        return this.renderOrderDetailsPage(req, res);
      } else {
        // Otherwise render the orders page
        return this.renderOrdersPage(req, res);
      }
    } catch (error) {
      res.status(500).render('error', { 
        title: 'Error - Pogonka',
        message: error instanceof Error ? error.message : 'Failed to complete billing' 
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
      const deleted = await this.orderService.deleteOrder(id);

      if (!deleted) {
        res.status(404).render('error', { 
          title: 'Error - Pogonka',
          message: 'Order not found' 
        });
        return;
      }

      // Always redirect to the orders page after delete
      return this.renderOrdersPage(req, res);
    } catch (error) {
      res.status(500).render('error', { 
        title: 'Error - Pogonka',
        message: 'Failed to delete order' 
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
      const orders = await this.orderService.getAllOrders();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDtos = OrderMapper.toDtoList(orders, baseUrl);

      res.render('orders', { 
        title: 'Orders - Pogonka',
        orders: orderDtos,
        breadcrumbs: [
          { label: 'Home', url: '/' },
          { label: 'Orders', url: '/orders' }
        ]
      });
    } catch (error) {
      res.status(500).render('error', { 
        title: 'Error - Pogonka',
        message: 'Failed to retrieve orders' 
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
          title: 'Error - Pogonka',
          message: 'Order not found' 
        });
        return;
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDto = OrderMapper.toDto(order, baseUrl);

      res.render('order-details', { 
        title: `Order ${id} - Pogonka`,
        order: orderDto,
        breadcrumbs: [
          { label: 'Home', url: '/' },
          { label: 'Orders', url: '/orders' },
          { label: `Order ${id.substring(0, 8)}...`, url: `/orders/${id}` }
        ]
      });
    } catch (error) {
      res.status(500).render('error', { 
        title: 'Error - Pogonka',
        message: 'Failed to retrieve order details' 
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
        title: 'Create Order - Pogonka',
        breadcrumbs: [
          { label: 'Home', url: '/' },
          { label: 'Orders', url: '/orders' },
          { label: 'Create Order', url: '/orders/create' }
        ]
      });
    } catch (error) {
      res.status(500).render('error', { 
        title: 'Error - Pogonka',
        message: 'Failed to render create order page' 
      });
    }
  }
}
