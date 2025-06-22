import { Product } from '../model/Product';
import { ProductId } from '../model/ProductId';

/**
 * ProductRepository interface defines the contract for accessing and manipulating Product entities.
 * Following the repository pattern from DDD, this abstraction separates the domain model from
 * the data access logic.
 */
export interface ProductRepository {
  /**
   * Find a product by its unique identifier
   * @param id The unique identifier of the product
   * @returns A Promise that resolves to the Product if found, or null if not found
   */
  findById(id: ProductId): Promise<Product | null>;

  /**
   * Find all products
   * @returns A Promise that resolves to an array of Products
   */
  findAll(): Promise<Product[]>;

  /**
   * Find products with pagination
   * @param limit The maximum number of products to return
   * @param offset The number of products to skip
   * @returns A Promise that resolves to an object containing the products and total count
   */
  findWithPagination(limit: number, offset: number): Promise<{ products: Product[], total: number }>;

  /**
   * Search products by name with pagination
   * @param query The search query string
   * @param limit The maximum number of products to return
   * @param offset The number of products to skip
   * @returns A Promise that resolves to an object containing the matching products and total count
   */
  searchByNameWithPagination(query: string, limit: number, offset: number): Promise<{ products: Product[], total: number }>;

  /**
   * Save a product (create or update)
   * @param product The product to save
   * @returns A Promise that resolves to the saved Product
   */
  save(product: Product): Promise<Product>;

  /**
   * Delete a product by its unique identifier
   * @param id The unique identifier of the product to delete
   * @returns A Promise that resolves to true if the product was deleted, or false if not found
   */
  delete(id: ProductId): Promise<boolean>;
}