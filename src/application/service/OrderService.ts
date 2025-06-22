import { Order } from '../../domain/model/Order';
import { OrderRepository } from '../../domain/repository/OrderRepository';
import { CustomerInfo } from '../../domain/model/CustomerInfo';
import { OrderStatus } from '../../domain/model/OrderStatus';
import { GenerateId } from "../../domain/util/GenerateId";
import { ProductId } from '../../domain/model/ProductId';
import { Money } from '../../domain/model/Money';
import { OrderItem } from '../../domain/model/OrderItem';
import { OrderItemId } from '../../domain/model/OrderItemId';

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
   * Search orders with pagination
   * @param query The search query string
   * @param limit The maximum number of orders to return
   * @param offset The number of orders to skip
   * @returns A Promise that resolves to an object containing the matching orders and total count
   */
  async searchOrdersWithPagination(query: string, limit: number, offset: number): Promise<{ orders: Order[], total: number }> {
    return this.orderRepository.searchWithPagination(query, limit, offset);
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

  /**
   * Add an item to an order
   * @param orderId The ID of the order
   * @param productId The ID of the product
   * @param quantity The quantity of the product
   * @param price The price of the product
   * @param currency The currency of the price
   * @returns A Promise that resolves to the updated Order if found, or null if not found
   */
  async addOrderItem(orderId: string, productId: string, quantity: number, price: number, currency: string = 'EUR'): Promise<Order | null> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      return null;
    }

    const productIdObj = new ProductId(productId);
    const priceObj = new Money(price, currency);

    order.addItem(productIdObj, quantity, priceObj);
    return this.orderRepository.save(order);
  }

  /**
   * Remove an item from an order
   * @param orderId The ID of the order
   * @param orderItemId The ID of the order item to remove
   * @returns A Promise that resolves to the updated Order if found and item removed, or null if not found or item not removed
   */
  async removeOrderItem(orderId: string, orderItemId: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      return null;
    }

    const orderItemIdObj = new OrderItemId(orderItemId);
    const removed = order.removeItem(orderItemIdObj);

    if (!removed) {
      return null;
    }

    return this.orderRepository.save(order);
  }

  /**
   * Recalculate the total amount of an order
   * @param orderId The ID of the order
   * @returns A Promise that resolves to the updated Order if found, or null if not found
   */
  async recalculateOrderTotal(orderId: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      return null;
    }

    order.recalculateTotal();
    return this.orderRepository.save(order);
  }

  /**
   * Update an order with new customer information
   * @param id The ID of the order to update
   * @param customerName The new name of the customer
   * @param taxNumber The new tax/VAT number of the customer
   * @param email The new email of the customer
   * @returns A Promise that resolves to the updated Order if found, or null if not found
   */
  async updateOrder(id: string, customerName: string, taxNumber: string, email: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      return null;
    }

    // Create a new order with the same ID, updated customer info, and same status
    const customerInfo = new CustomerInfo(customerName, taxNumber, email);
    const updatedOrder = new Order(id, customerInfo, order.status);

    // Copy the items from the original order
    for (const item of order.items) {
      updatedOrder.addItem(item.productId, item.quantity, item.price);
    }

    // Save the updated order
    return this.orderRepository.save(updatedOrder);
  }
}
