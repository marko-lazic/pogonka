/**
 * OrderItemId is a value object that represents a unique identifier for an order item.
 * It wraps a string value and provides validation and equality comparison.
 */
export class OrderItemId {
  constructor(private readonly _value: string) {
    this.validate(_value);
  }

  get value(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Order item ID cannot be empty');
    }
  }

  equals(other: OrderItemId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON() {
    return this._value;
  }
}