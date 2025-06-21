import { OrderStatus } from '../../domain/model/OrderStatus';
import { ViewOrderStatus } from '../view/ViewOrderStatus';

/**
 * OrderStatusMapper provides methods to map between domain OrderStatus and view ViewOrderStatus.
 * This maintains the separation between domain and interface layers according to DDD principles.
 */
export class OrderStatusMapper {
  /**
   * Maps a domain OrderStatus to a view ViewOrderStatus.
   */
  public static toViewOrderStatus(domainStatus: OrderStatus): ViewOrderStatus {
    switch (domainStatus) {
      case OrderStatus.CREATED:
        return ViewOrderStatus.CREATED;
      case OrderStatus.CONFIRMED:
        return ViewOrderStatus.CONFIRMED;
      case OrderStatus.CANCELED:
        return ViewOrderStatus.CANCELED;
      case OrderStatus.PAYMENT_OF_AVANS:
        return ViewOrderStatus.PAYMENT_OF_AVANS;
      case OrderStatus.PRODUCTION_AND_PACKAGING:
        return ViewOrderStatus.PRODUCTION_AND_PACKAGING;
      case OrderStatus.DELIVERY:
        return ViewOrderStatus.DELIVERY;
      case OrderStatus.PROJECT_BILLING:
        return ViewOrderStatus.PROJECT_BILLING;
      default:
        throw new Error(`Unknown domain status: ${domainStatus}`);
    }
  }

  /**
   * Maps a view ViewOrderStatus to a domain OrderStatus.
   * This is useful when receiving input from the interface layer.
   */
  public static toDomainOrderStatus(viewStatus: ViewOrderStatus): OrderStatus {
    switch (viewStatus) {
      case ViewOrderStatus.CREATED:
        return OrderStatus.CREATED;
      case ViewOrderStatus.CONFIRMED:
        return OrderStatus.CONFIRMED;
      case ViewOrderStatus.CANCELED:
        return OrderStatus.CANCELED;
      case ViewOrderStatus.PAYMENT_OF_AVANS:
        return OrderStatus.PAYMENT_OF_AVANS;
      case ViewOrderStatus.PRODUCTION_AND_PACKAGING:
        return OrderStatus.PRODUCTION_AND_PACKAGING;
      case ViewOrderStatus.DELIVERY:
        return OrderStatus.DELIVERY;
      case ViewOrderStatus.PROJECT_BILLING:
        return OrderStatus.PROJECT_BILLING;
      default:
        throw new Error(`Unknown view status: ${viewStatus}`);
    }
  }
}