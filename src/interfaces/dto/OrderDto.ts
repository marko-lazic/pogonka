import { CustomerInfoDto } from './CustomerInfoDto';
import { LinkDto } from './LinkDto';
import { OrderStatus } from '../../domain/model/OrderStatus';

/**
 * OrderDto represents an order in API responses, including HATEOAS links.
 */
export interface OrderDto {
  /**
   * The unique identifier of the order
   */
  id: string;

  /**
   * The customer information for the order
   */
  customerInfo: CustomerInfoDto;

  /**
   * The status of the order
   */
  status: OrderStatus;

  /**
   * The date and time when the order was created
   */
  createdAt: string;

  /**
   * The date and time when the order was last updated
   */
  updatedAt: string;

  /**
   * HATEOAS links related to the order
   */
  _links: LinkDto[];
}