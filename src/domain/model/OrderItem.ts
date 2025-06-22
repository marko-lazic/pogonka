import { OrderItemId } from './OrderItemId';
import { ProductId } from './ProductId';
import { Money } from './Money';

/**
 * OrderItem is an entity that represents an item in an order.
 * It contains a unique identifier, product ID, quantity, and price.
 */
export class OrderItem {
  constructor(
    private readonly _id: OrderItemId,
    private readonly _productId: ProductId,
    private _quantity: number,
    private _price: Money
  ) {
    this.validateQuantity(_quantity);
  }

  get id(): OrderItemId {
    return this._id;
  }

  get productId(): ProductId {
    return this._productId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get price(): Money {
    return this._price;
  }

  /**
   * Calculate the total price for this item (quantity * price)
   * @returns The total price as a Money object
   */
  calculateTotal(): Money {
    return this._price.multiply(this._quantity);
  }

  updateQuantity(quantity: number): void {
    this.validateQuantity(quantity);
    this._quantity = quantity;
  }

  updatePrice(price: Money): void {
    this._price = price;
  }

  private validateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Quantity must be a positive integer');
    }
  }

  toJSON() {
    return {
      id: this._id.toJSON(),
      productId: this._productId.toJSON(),
      quantity: this._quantity,
      price: this._price.toJSON(),
      total: this.calculateTotal().toJSON()
    };
  }
}