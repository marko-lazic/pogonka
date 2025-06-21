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
   * Get all orders
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const orders = await this.orderService.getAllOrders();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDtos = OrderMapper.toDtoList(orders, baseUrl);
      
      res.json({
        orders: orderDtos,
        _links: [
          {
            rel: 'self',
            href: `${baseUrl}/orders`,
            method: 'GET'
          },
          {
            rel: 'create',
            href: `${baseUrl}/orders`,
            method: 'POST'
          }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve orders' });
    }
  }

  /**
   * Get an order by ID
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);
      
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDto = OrderMapper.toDto(order, baseUrl);
      
      res.json(orderDto);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve order' });
    }
  }

  /**
   * Create a new order
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { customerName, taxNumber, email } = req.body;
      
      if (!customerName || !taxNumber || !email) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      const order = await this.orderService.createOrder(customerName, taxNumber, email);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDto = OrderMapper.toDto(order, baseUrl);
      
      res.status(201).json(orderDto);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create order' });
      }
    }
  }

  /**
   * Update an order's status
   * @param req The HTTP request
   * @param res The HTTP response
   */
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !Object.values(OrderStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }
      
      const order = await this.orderService.updateOrderStatus(id, status);
      
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDto = OrderMapper.toDto(order, baseUrl);
      
      res.json(orderDto);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update order' });
      }
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
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDto = OrderMapper.toDto(order, baseUrl);
      
      res.json(orderDto);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to confirm order' });
      }
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
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDto = OrderMapper.toDto(order, baseUrl);
      
      res.json(orderDto);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to cancel order' });
      }
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
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDto = OrderMapper.toDto(order, baseUrl);
      
      res.json(orderDto);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to mark order as paid' });
      }
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
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDto = OrderMapper.toDto(order, baseUrl);
      
      res.json(orderDto);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to start production' });
      }
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
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDto = OrderMapper.toDto(order, baseUrl);
      
      res.json(orderDto);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to start delivery' });
      }
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
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const orderDto = OrderMapper.toDto(order, baseUrl);
      
      res.json(orderDto);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to complete billing' });
      }
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
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete order' });
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
        orders: orderDtos
      });
    } catch (error) {
      res.status(500).render('error', { 
        title: 'Error - Pogonka',
        message: 'Failed to retrieve orders' 
      });
    }
  }
}