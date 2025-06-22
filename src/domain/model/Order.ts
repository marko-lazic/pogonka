import { v4 as uuidv4 } from 'uuid';
import { CustomerInfo } from './CustomerInfo';
import { OrderStatus } from './OrderStatus';
import { OrderItem } from './OrderItem';
import { OrderItemId } from './OrderItemId';
import { ProductId } from './ProductId';
import { Money } from './Money';

/**
 * Order is an entity and root aggregate that represents a customer order.
 * It contains a unique identifier, customer information, status, and a list of order items.
 */
export class Order {
  private readonly _id: string;
  private _status: OrderStatus;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _items: OrderItem[] = [];
  private _totalAmount: Money = new Money(0);

  constructor(
    id: string | null,
    private readonly _customerInfo: CustomerInfo,
    status: OrderStatus = OrderStatus.CREATED
  ) {
    this._id = id || uuidv4();
    this._status = status;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get customerInfo(): CustomerInfo {
    return this._customerInfo;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get items(): OrderItem[] {
    return [...this._items]; // Return a copy to prevent direct modification
  }

  get totalAmount(): Money {
    return this._totalAmount;
  }

  updateStatus(newStatus: OrderStatus): void {
    this._status = newStatus;
    this._updatedAt = new Date();
  }

  confirm(): void {
    if (this._status !== OrderStatus.CREATED) {
      throw new Error('Order can only be confirmed when in CREATED status');
    }
    this.updateStatus(OrderStatus.CONFIRMED);
  }

  cancel(): void {
    if (this._status === OrderStatus.CANCELED) {
      throw new Error('Order is already canceled');
    }
    if (this._status === OrderStatus.DELIVERY || this._status === OrderStatus.PROJECT_BILLING) {
      throw new Error('Cannot cancel an order that is already in delivery or billed');
    }
    this.updateStatus(OrderStatus.CANCELED);
  }

  markPaymentReceived(): void {
    if (this._status !== OrderStatus.CONFIRMED) {
      throw new Error('Order must be confirmed before receiving payment');
    }
    this.updateStatus(OrderStatus.PAYMENT_OF_AVANS);
  }

  startProduction(): void {
    if (this._status !== OrderStatus.PAYMENT_OF_AVANS) {
      throw new Error('Payment must be received before starting production');
    }
    this.updateStatus(OrderStatus.PRODUCTION_AND_PACKAGING);
  }

  startDelivery(): void {
    if (this._status !== OrderStatus.PRODUCTION_AND_PACKAGING) {
      throw new Error('Production must be completed before delivery');
    }
    this.updateStatus(OrderStatus.DELIVERY);
  }

  completeBilling(): void {
    if (this._status !== OrderStatus.DELIVERY) {
      throw new Error('Order must be delivered before completing billing');
    }
    this.updateStatus(OrderStatus.PROJECT_BILLING);
  }

  /**
   * Add an item to the order
   * @param productId The ID of the product
   * @param quantity The quantity of the product
   * @param price The price of the product
   * @returns The added order item
   */
  addItem(productId: ProductId, quantity: number, price: Money): OrderItem {
    const itemId = new OrderItemId(uuidv4());
    const orderItem = new OrderItem(itemId, productId, quantity, price);
    this._items.push(orderItem);
    this._updatedAt = new Date();
    this.recalculateTotal();
    return orderItem;
  }

  /**
   * Remove an item from the order
   * @param orderItemId The ID of the order item to remove
   * @returns True if the item was removed, false if not found
   */
  removeItem(orderItemId: OrderItemId): boolean {
    const initialLength = this._items.length;
    this._items = this._items.filter(item => !item.id.equals(orderItemId));
    const removed = initialLength > this._items.length;

    if (removed) {
      this._updatedAt = new Date();
      this.recalculateTotal();
    }

    return removed;
  }

  /**
   * Recalculate the total amount of the order
   */
  recalculateTotal(): void {
    if (this._items.length === 0) {
      this._totalAmount = new Money(0);
      return;
    }

    let total = new Money(0);
    for (const item of this._items) {
      total = total.add(item.calculateTotal());
    }
    this._totalAmount = total;
  }

  toJSON() {
    return {
      id: this._id,
      customerInfo: this._customerInfo.toJSON(),
      status: this._status,
      items: this._items.map(item => item.toJSON()),
      totalAmount: this._totalAmount.toJSON(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}
