/**
 * OrderItemDto represents an order item in API responses.
 */
export interface OrderItemDto {
  /**
   * The unique identifier of the order item
   */
  id: string;

  /**
   * The unique identifier of the product
   */
  productId: string;

  /**
   * The name of the product (optional)
   */
  productName?: string;

  /**
   * The quantity of the product
   */
  quantity: number;

  /**
   * The price of the product
   */
  price: {
    amount: number;
    currency: string;
  };

  /**
   * The total price for this item (quantity * price)
   */
  total: {
    amount: number;
    currency: string;
  };
}
