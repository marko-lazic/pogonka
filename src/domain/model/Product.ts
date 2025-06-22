import { ProductId } from './ProductId';
import { Money } from './Money';

/**
 * Product is an entity and root aggregate that represents a product.
 * It contains a unique identifier, name, and price.
 */
export class Product {
  constructor(
    private readonly _id: ProductId,
    private _name: string,
    private _price: Money
  ) {
    this.validateName(_name);
  }

  get id(): ProductId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get price(): Money {
    return this._price;
  }

  updateName(name: string): void {
    this.validateName(name);
    this._name = name;
  }

  updatePrice(price: Money): void {
    this._price = price;
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }
  }

  toJSON() {
    return {
      id: this._id.toJSON(),
      name: this._name,
      price: this._price.toJSON()
    };
  }
}
