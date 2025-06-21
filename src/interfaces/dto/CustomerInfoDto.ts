/**
 * CustomerInfoDto represents customer information in API responses.
 */
export interface CustomerInfoDto {
  /**
   * The name of the customer
   */
  name: string;

  /**
   * The tax/VAT number of the customer
   */
  taxNumber: string;

  /**
   * The email of the customer
   */
  email: string;
}