import { Order } from '../../domain/model/Order';
import { OrderRepository } from '../../domain/repository/OrderRepository';
import { CustomerInfo } from '../../domain/model/CustomerInfo';
import { OrderStatus } from '../../domain/model/OrderStatus';
import {PidGenerator} from "../util/PidGenerator";

/**
 * MockOrderRepository is an in-memory implementation of the OrderRepository interface.
 * It's used for testing and development purposes.
 */
export class MockOrderRepository implements OrderRepository {
  private orders: Map<string, Order> = new Map();
  private idGenerator =  new PidGenerator();

  constructor() {
    // Initialize with some sample data
    this.initializeSampleData();
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async save(order: Order): Promise<Order> {
    this.orders.set(order.id, order);
    return order;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.orders.has(id)) {
      return false;
    }
    this.orders.delete(id);
    return true;
  }

  private initializeSampleData(): void {
    // Create some sample customer info
    const customer1 = new CustomerInfo(
      'Acme Corporation',
      '123456789',
      'contact@acme.com'
    );

    const customer2 = new CustomerInfo(
      'Globex Industries',
      '987654321',
      'info@globex.com'
    );

    const customer3 = new CustomerInfo(
      'Stark Enterprises',
      '456789123',
      'tony@stark.com'
    );

    // Create some sample orders
    const order1 = new Order(this.idGenerator.id(), customer1, OrderStatus.CONFIRMED);
    const order2 = new Order(this.idGenerator.id(), customer2, OrderStatus.PAYMENT_OF_AVANS);
    const order3 = new Order(this.idGenerator.id(), customer3, OrderStatus.PRODUCTION_AND_PACKAGING);
    const order4 = new Order(this.idGenerator.id(), customer1, OrderStatus.CREATED);

    // Add orders to the map
    this.orders.set(order1.id, order1);
    this.orders.set(order2.id, order2);
    this.orders.set(order3.id, order3);
    this.orders.set(order4.id, order4);
  }
}