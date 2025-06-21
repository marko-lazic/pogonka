/**
 * CustomerInfo is a value object that represents customer information.
 * It contains the customer's name, tax/VAT number, and email.
 */
export class CustomerInfo {
  constructor(
    private readonly _name: string,
    private readonly _taxNumber: string,
    private readonly _email: string
  ) {
    this.validateName(_name);
    this.validateEmail(_email);
  }

  get name(): string {
    return this._name;
  }

  get taxNumber(): string {
    return this._taxNumber;
  }

  get email(): string {
    return this._email;
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Customer name cannot be empty');
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  equals(other: CustomerInfo): boolean {
    return (
      this._name === other._name &&
      this._taxNumber === other._taxNumber &&
      this._email === other._email
    );
  }

  toJSON() {
    return {
      name: this._name,
      taxNumber: this._taxNumber,
      email: this._email
    };
  }
}
