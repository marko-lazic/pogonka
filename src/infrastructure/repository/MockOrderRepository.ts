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
    if (!query) {
      return this.findWithPagination(limit, offset);
    }

    if (query.trim() === '') {
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
      'Matijević',
      'Agrokor',
      'Dunav Osiguranje',
      'Galenika',
      'Jugopetrol',
      'Lasta',
      'Maxi',
      'Merkator',
      'Planinka',
      'Podravka',
      'Prva Petoletka',
      'Sintelon',
      'Sojaprotein',
      'Sunoko',
      'Takovo',
      'Tigar',
      'Univerexport',
      'Victoria Group',
      'Voda Vrnjci',
      'Yuhor',
      'Zdravlje Leskovac'
    ];

    // Serbian domains
    const domains = ['rs', 'co.rs', 'org.rs', 'edu.rs', 'in.rs'];

    // Map to store company information for consistency
    const companyInfoMap = new Map<string, { taxNumber: string, email: string }>();

    // Function to get a random date within the last 3 months with distribution curve
    // More recent dates are more likely
    const getRandomDate = (): Date => {
      const now = new Date();
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);

      // Generate a random value between 0 and 1 with bias towards 1 (more recent dates)
      // Using power distribution to create the curve
      const randomFactor = Math.pow(Math.random(), 2); // Square makes it more likely to be closer to 1

      // Calculate the time difference and apply the random factor
      const timeDiff = now.getTime() - threeMonthsAgo.getTime();
      const randomTime = threeMonthsAgo.getTime() + (timeDiff * randomFactor);

      return new Date(randomTime);
    };

    // Function to get order status based on date (reverse curve)
    // Newer orders are more likely to be in earlier states
    const getStatusBasedOnDate = (date: Date): OrderStatus => {
      const now = new Date();
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);

      // Calculate how old the order is as a percentage (0 = now, 1 = three months ago)
      const totalTimeSpan = now.getTime() - threeMonthsAgo.getTime();
      const orderAge = (now.getTime() - date.getTime()) / totalTimeSpan;

      // Apply reverse curve - older orders more likely to be in later states
      // Using power distribution for the curve
      const progressionFactor = Math.pow(orderAge, 1.5); // Higher exponent makes curve steeper

      // Get all statuses except CANCELED (we'll handle that separately)
      const statuses = [
        OrderStatus.CREATED,
        OrderStatus.CONFIRMED,
        OrderStatus.PAYMENT_OF_AVANS,
        OrderStatus.PRODUCTION_AND_PACKAGING,
        OrderStatus.DELIVERY,
        OrderStatus.PROJECT_BILLING
      ];

      // Calculate index based on progression factor
      const index = Math.min(
        Math.floor(progressionFactor * statuses.length),
        statuses.length - 1
      );

      // 10% chance of CANCELED status, regardless of date
      if (Math.random() < 0.1) {
        return OrderStatus.CANCELED;
      }

      return statuses[index];
    };

    // Generate random orders with Serbian domain information
    // Increased number of orders to 100
    for (let i = 0; i < 100; i++) {
      // Generate random company name
      const companyName = companyNames[Math.floor(Math.random() * companyNames.length)];

      // Get or create consistent company info
      let taxNumber: string;
      let email: string;

      if (companyInfoMap.has(companyName)) {
        // Use existing info for consistency
        const info = companyInfoMap.get(companyName)!;
        taxNumber = info.taxNumber;
        email = info.email;
      } else {
        // Generate new info for this company
        taxNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
        const companySlug = companyName.toLowerCase().replace(/\s+/g, '');
        const domain = domains[Math.floor(Math.random() * domains.length)];
        email = `info@${companySlug}.${domain}`;

        // Store for future use
        companyInfoMap.set(companyName, { taxNumber, email });
      }

      // Create customer info
      const customer = new CustomerInfo(companyName, taxNumber, email);

      // Get random date with distribution curve
      const createdAt = getRandomDate();

      // Get status based on date (reverse curve)
      const status = getStatusBasedOnDate(createdAt);

      // Create order with the generated ID
      const order = new Order(this.idGenerator.id(), customer, status);

      // Set the createdAt date to our generated date
      Object.defineProperty(order, '_createdAt', { value: createdAt });

      // If the status is not CREATED, set a realistic updatedAt timestamp
      if (status !== OrderStatus.CREATED) {
        // Calculate a random time after createdAt but before now
        const now = new Date();
        const timeSinceCreation = now.getTime() - createdAt.getTime();

        // Random factor between 0.2 and 0.8 of the time since creation
        const randomDelay = timeSinceCreation * (0.2 + Math.random() * 0.6);
        const updatedAt = new Date(createdAt.getTime() + randomDelay);

        // Set the updatedAt property
        Object.defineProperty(order, '_updatedAt', { value: updatedAt });
      }

      // Add order to the map
      this.orders.set(order.id, order);
    }
  }
}
