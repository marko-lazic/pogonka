/**
 * ProductMapper is responsible for mapping between domain entities and DTOs.
 */
export class ProductMapper {
  /**
   * Map a Product domain entity to a DTO
   * @param product The Product domain entity
   * @param baseUrl The base URL for API endpoints
   * @returns A DTO representing the product
   */
  static toDto(product: any, baseUrl: string): any {
    return {
      id: product.id.value,
      name: product.name,
      price: {
        amount: product.price.amount,
        currency: product.price.currency
      },
      _links: {
        self: {
          href: `${baseUrl}/api/products/${product.id.value}`
        }
      }
    };
  }

  /**
   * Map a list of Product domain entities to DTOs
   * @param products The list of Product domain entities
   * @param baseUrl The base URL for API endpoints
   * @returns A list of DTOs representing the products
   */
  static toDtoList(products: any[], baseUrl: string): any[] {
    return products.map(product => this.toDto(product, baseUrl));
  }
}