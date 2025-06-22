import { CustomerInfoDto } from './CustomerInfoDto';
import { LinkDto } from './LinkDto';
import { ViewOrderStatus } from '../view/ViewOrderStatus';
import { OrderItemDto } from './OrderItemDto';

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
   * The status of the order in the view/interface layer
   */
  status: ViewOrderStatus;

  /**
   * The date and time when the order was created
   */
  createdAt: string;

  /**
   * The date and time when the order was last updated
   */
  updatedAt: string;

  /**
   * The items in the order
   */
  items: OrderItemDto[];

  /**
   * The total amount of the order
   */
  totalAmount: {
    amount: number;
    currency: string;
  };

  /**
   * HATEOAS links related to the order
   */
  _links: LinkDto[];
}
