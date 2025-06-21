import { Order } from '../../domain/model/Order';
import { OrderRepository } from '../../domain/repository/OrderRepository';
import { CustomerInfo } from '../../domain/model/CustomerInfo';
import { OrderStatus } from '../../domain/model/OrderStatus';
import {PidGenerator} from "../util/PidGenerator";
import { format } from 'date-fns';

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
    return Array.from(this.orders.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async findWithPagination(limit: number, offset: number): Promise<{ orders: Order[], total: number }> {
    const allOrders = Array.from(this.orders.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const total = allOrders.length;
    const paginatedOrders = allOrders.slice(offset, offset + limit);
    return { orders: paginatedOrders, total };
  }

  async searchWithPagination(query: string, limit: number, offset: number): Promise<{ orders: Order[], total: number }> {
    if (!query || query.trim() === '') {
      return this.findWithPagination(limit, offset);
    }

    const normalizedQuery = query.toLowerCase().trim();
    const allOrders = Array.from(this.orders.values());

    const filteredOrders = allOrders.filter(order => {
      // Search by order ID
      if (order.id.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      // Search by customer info (name, tax number, email)
      const customerInfo = order.customerInfo;
      if (
        customerInfo.name.toLowerCase().includes(normalizedQuery) ||
        customerInfo.taxNumber.toLowerCase().includes(normalizedQuery) ||
        customerInfo.email.toLowerCase().includes(normalizedQuery)
      ) {
        return true;
      }

      // Search by status (as displayed on screen)
      if (order.status.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      // Search by formatted date (as displayed on screen)
      // Using different date formats to accommodate various user inputs
      const dateFormats = ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy', 'dd.MM.yyyy'];
      for (const dateFormat of dateFormats) {
        const formattedDate = format(order.createdAt, dateFormat).toLowerCase();
        if (formattedDate.includes(normalizedQuery)) {
          return true;
        }
      }

      return false;
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const total = filteredOrders.length;
    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    return { orders: paginatedOrders, total };
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
    // Serbian company names
    const companyNames = [
      'Telekom Srbija',
      'NIS - Naftna Industrija Srbije',
      'Elektroprivreda Srbije',
      'Delta Holding',
      'Komercijalna Banka',
      'Hemofarm',
      'Frikom',
      'Jaffa',
      'Imlek',
      'Bambi',
      'Knjaz Miloš',
      'Zlatiborac',
      'Štark',
      'Metalac',
      'Simpo',
      'Soko Štark',
      'Dijamant',
      'Nectar',
      'Carnex',
      'Matijević'
    ];

    // Serbian domains
    const domains = ['rs', 'co.rs', 'org.rs', 'edu.rs', 'in.rs'];

    // Generate random orders with Serbian domain information
    for (let i = 0; i < 20; i++) {
      // Generate random company name
      const companyName = companyNames[Math.floor(Math.random() * companyNames.length)];

      // Generate random tax number (PIB in Serbia is 9 digits)
      const taxNumber = Math.floor(100000000 + Math.random() * 900000000).toString();

      // Generate random email
      const companySlug = companyName.toLowerCase().replace(/\s+/g, '');
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const email = `info@${companySlug}.${domain}`;

      // Create customer info
      const customer = new CustomerInfo(companyName, taxNumber, email);

      // Randomly select an order status
      const statuses = Object.values(OrderStatus);
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Create order
      const order = new Order(this.idGenerator.id(), customer, status);

      // Add order to the map
      this.orders.set(order.id, order);
    }
  }
}
