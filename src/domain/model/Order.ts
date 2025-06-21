import { v4 as uuidv4 } from 'uuid';
import { CustomerInfo } from './CustomerInfo';
import { OrderStatus } from './OrderStatus';

/**
 * Order is an entity and root aggregate that represents a customer order.
 * It contains a unique identifier, customer information, and status.
 */
export class Order {
  private readonly _id: string;
  private _status: OrderStatus;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

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

  toJSON() {
    return {
      id: this._id,
      customerInfo: this._customerInfo.toJSON(),
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}