/**
 * ProductId is a value object that represents a unique identifier for a product.
 * It wraps a string value and provides validation and equality comparison.
 */
export class ProductId {
  constructor(private readonly _value: string) {
    this.validate(_value);
  }

  get value(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Product ID cannot be empty');
    }
  }

  equals(other: ProductId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON() {
    return this._value;
  }
}