import { Order } from '../model/Order';

/**
 * OrderRepository interface defines the contract for accessing and manipulating Order entities.
 * Following the repository pattern from DDD, this abstraction separates the domain model from
 * the data access logic.
 */
export interface OrderRepository {
  /**
   * Find an order by its unique identifier
   * @param id The unique identifier of the order
   * @returns A Promise that resolves to the Order if found, or null if not found
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Find all orders
   * @returns A Promise that resolves to an array of Orders
   */
  findAll(): Promise<Order[]>;

  /**
   * Save an order (create or update)
   * @param order The order to save
   * @returns A Promise that resolves to the saved Order
   */
  save(order: Order): Promise<Order>;

  /**
   * Delete an order by its unique identifier
   * @param id The unique identifier of the order to delete
   * @returns A Promise that resolves to true if the order was deleted, or false if not found
   */
  delete(id: string): Promise<boolean>;
}