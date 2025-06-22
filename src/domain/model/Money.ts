/**
 * Money is a value object that represents a monetary amount with a currency.
 * It contains an amount and a currency code.
 */
export class Money {
  constructor(
    private readonly _amount: number,
    private readonly _currency: string = 'EUR'
  ) {
    this.validateAmount(_amount);
    this.validateCurrency(_currency);
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  private validateAmount(amount: number): void {
    if (isNaN(amount) || amount < 0) {
      throw new Error('Amount must be a non-negative number');
    }
  }

  private validateCurrency(currency: string): void {
    if (!currency || currency.trim().length === 0) {
      throw new Error('Currency cannot be empty');
    }
    // Could add more validation for valid currency codes if needed
  }

  add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this._amount + other._amount, this._currency);
  }

  subtract(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    const result = this._amount - other._amount;
    if (result < 0) {
      throw new Error('Result cannot be negative');
    }
    return new Money(result, this._currency);
  }

  multiply(multiplier: number): Money {
    if (multiplier < 0) {
      throw new Error('Multiplier cannot be negative');
    }
    return new Money(this._amount * multiplier, this._currency);
  }

  equals(other: Money): boolean {
    return (
      this._amount === other._amount &&
      this._currency === other._currency
    );
  }

  toJSON() {
    return {
      amount: this._amount,
      currency: this._currency
    };
  }
}