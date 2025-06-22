import { Product } from '../../domain/model/Product';
import { ProductRepository } from '../../domain/repository/ProductRepository';
import { ProductId } from '../../domain/model/ProductId';
import { Money } from '../../domain/model/Money';
import { PidGenerator } from '../../infrastructure/util/PidGenerator';

/**
 * ProductService is an application service that handles operations related to products.
 * It uses the ProductRepository to perform operations on products.
 */
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly pidGenerator: PidGenerator
  ) {}

  /**
   * Get all products
   * @returns A Promise that resolves to an array of Products
   */
  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  /**
   * Get products with pagination
   * @param limit The maximum number of products to return
   * @param offset The number of products to skip
   * @returns A Promise that resolves to an object containing the products and total count
   */
  async getProductsWithPagination(limit: number, offset: number): Promise<{ products: Product[], total: number }> {
    return this.productRepository.findWithPagination(limit, offset);
  }

  /**
   * Search products by name with pagination
   * @param query The search query string
   * @param limit The maximum number of products to return
   * @param offset The number of products to skip
   * @returns A Promise that resolves to an object containing the matching products and total count
   */
  async searchProductsByNameWithPagination(query: string, limit: number, offset: number): Promise<{ products: Product[], total: number }> {
    return this.productRepository.searchByNameWithPagination(query, limit, offset);
  }

  /**
   * Get a product by its ID
   * @param id The ID of the product to get
   * @returns A Promise that resolves to the Product if found, or null if not found
   */
  async getProductById(id: string): Promise<Product | null> {
    const productId = new ProductId(id);
    return this.productRepository.findById(productId);
  }

  /**
   * Create a new product
   * @param name The name of the product
   * @param price The price of the product
   * @param currency The currency of the price
   * @returns A Promise that resolves to the created Product
   */
  async createProduct(name: string, price: number, currency: string = 'EUR'): Promise<Product> {
    const productId = new ProductId(this.pidGenerator.productId());
    const productPrice = new Money(price, currency);
    const product = new Product(productId, name, productPrice);
    return this.productRepository.save(product);
  }

  /**
   * Update a product
   * @param id The ID of the product to update
   * @param name The new name of the product
   * @param price The new price of the product
   * @param currency The new currency of the price
   * @returns A Promise that resolves to the updated Product if found, or null if not found
   */
  async updateProduct(id: string, name: string, price: number, currency: string = 'EUR'): Promise<Product | null> {
    const productId = new ProductId(id);
    const product = await this.productRepository.findById(productId);
    if (!product) {
      return null;
    }
    product.updateName(name);
    product.updatePrice(new Money(price, currency));
    return this.productRepository.save(product);
  }

  /**
   * Delete a product
   * @param id The ID of the product to delete
   * @returns A Promise that resolves to true if the product was deleted, or false if not found
   */
  async deleteProduct(id: string): Promise<boolean> {
    const productId = new ProductId(id);
    return this.productRepository.delete(productId);
  }
}