import { Order } from '../../domain/model/Order';
import { OrderRepository } from '../../domain/repository/OrderRepository';
import { CustomerInfo } from '../../domain/model/CustomerInfo';
import { OrderStatus } from '../../domain/model/OrderStatus';
import {GenerateId} from "../../domain/util/GenerateId";

/**
 * OrderService is an application service that handles operations related to orders.
 * It uses the OrderRepository to perform operations on orders.
 */
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository, private readonly generateId: GenerateId) {}

  /**
   * Get all orders
   * @returns A Promise that resolves to an array of Orders
   */
  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  /**
   * Get orders with pagination
   * @param limit The maximum number of orders to return
   * @param offset The number of orders to skip
   * @returns A Promise that resolves to an object containing the orders and total count
   */
  async getOrdersWithPagination(limit: number, offset: number): Promise<{ orders: Order[], total: number }> {
    return this.orderRepository.findWithPagination(limit, offset);
  }

  /**
   * Get an order by its ID
   * @param id The ID of the order to get
   * @returns A Promise that resolves to the Order if found, or null if not found
   */
  async getOrderById(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }

  /**
   * Create a new order
   * @param customerName The name of the customer
   * @param taxNumber The tax/VAT number of the customer
   * @param email The email of the customer
   * @returns A Promise that resolves to the created Order
   */
  async createOrder(customerName: string, taxNumber: string, email: string): Promise<Order> {
    const customerInfo = new CustomerInfo(customerName, taxNumber, email);
    const id = this.generateId.id();
    const order = new Order(id, customerInfo);
    return this.orderRepository.save(order);
  }

  /**
   * Update the status of an order
   * @param id The ID of the order to update
   * @param status The new status of the order
   * @returns A Promise that resolves to the updated Order if found, or null if not found
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      return null;
    }
    order.updateStatus(status);
    return this.orderRepository.save(order);
  }

  /**
   * Confirm an order
   * @param id The ID of the order to confirm
   * @returns A Promise that resolves to the confirmed Order if found, or null if not found
   */
  async confirmOrder(id: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      return null;
    }
    order.confirm();
    return this.orderRepository.save(order);
  }

  /**
   * Cancel an order
   * @param id The ID of the order to cancel
   * @returns A Promise that resolves to the canceled Order if found, or null if not found
   */
  async cancelOrder(id: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      return null;
    }
    order.cancel();
    return this.orderRepository.save(order);
  }

  /**
   * Mark an order as having received payment
   * @param id The ID of the order to mark as paid
   * @returns A Promise that resolves to the updated Order if found, or null if not found
   */
  async markOrderAsPaid(id: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      return null;
    }
    order.markPaymentReceived();
    return this.orderRepository.save(order);
  }

  /**
   * Start production for an order
   * @param id The ID of the order to start production for
   * @returns A Promise that resolves to the updated Order if found, or null if not found
   */
  async startOrderProduction(id: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      return null;
    }
    order.startProduction();
    return this.orderRepository.save(order);
  }

  /**
   * Start delivery for an order
   * @param id The ID of the order to start delivery for
   * @returns A Promise that resolves to the updated Order if found, or null if not found
   */
  async startOrderDelivery(id: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      return null;
    }
    order.startDelivery();
    return this.orderRepository.save(order);
  }

  /**
   * Complete billing for an order
   * @param id The ID of the order to complete billing for
   * @returns A Promise that resolves to the updated Order if found, or null if not found
   */
  async completeOrderBilling(id: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      return null;
    }
    order.completeBilling();
    return this.orderRepository.save(order);
  }

  /**
   * Delete an order
   * @param id The ID of the order to delete
   * @returns A Promise that resolves to true if the order was deleted, or false if not found
   */
  async deleteOrder(id: string): Promise<boolean> {
    return this.orderRepository.delete(id);
  }
}
