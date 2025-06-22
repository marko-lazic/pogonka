import { Product } from '../../domain/model/Product';
import { ProductRepository } from '../../domain/repository/ProductRepository';
import { ProductId } from '../../domain/model/ProductId';
import { Money } from '../../domain/model/Money';
import { PidGenerator } from '../util/PidGenerator';

/**
 * MockProductRepository is an in-memory implementation of the ProductRepository interface.
 * It's used for testing and development purposes.
 */
export class MockProductRepository implements ProductRepository {
  private products: Map<string, Product> = new Map();
  private idGenerator = new PidGenerator();

  constructor() {
    // Initialize with one sample product
    this.initializeSampleData();
  }

  async findById(id: ProductId): Promise<Product | null> {
    return this.products.get(id.value) || null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findWithPagination(limit: number, offset: number): Promise<{ products: Product[], total: number }> {
    const allProducts = Array.from(this.products.values())
      .sort((a, b) => a.name.localeCompare(b.name));
    const total = allProducts.length;
    const paginatedProducts = allProducts.slice(offset, offset + limit);
    return { products: paginatedProducts, total };
  }

  async searchByNameWithPagination(query: string, limit: number, offset: number): Promise<{ products: Product[], total: number }> {
    if (!query) {
      return this.findWithPagination(limit, offset);
    }

    if (query.trim() === '') {
      return this.findWithPagination(limit, offset);
    }

    const normalizedQuery = query.toLowerCase().trim();
    const allProducts = Array.from(this.products.values());

    const filteredProducts = allProducts.filter(product => {
      // Search by product ID
      if (product.id.value.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      // Search by product name
      if (product.name.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      return false;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return { products: paginatedProducts, total };
  }

  async save(product: Product): Promise<Product> {
    this.products.set(product.id.value, product);
    return product;
  }

  async delete(id: ProductId): Promise<boolean> {
    if (!this.products.has(id.value)) {
      return false;
    }
    this.products.delete(id.value);
    return true;
  }

  private initializeSampleData(): void {
    // Create one sample product
    const productId = new ProductId(this.idGenerator.productId());
    const productPrice = new Money(19.99, 'EUR');
    const product = new Product(productId, 'Sample Product', productPrice);
    
    // Add product to the map
    this.products.set(product.id.value, product);
  }
}