import { Order } from '../../domain/model/Order';
import { OrderDto } from '../dto/OrderDto';
import { CustomerInfoDto } from '../dto/CustomerInfoDto';
import { LinkDto } from '../dto/LinkDto';
import { OrderStatus } from '../../domain/model/OrderStatus';
import { OrderStatusMapper } from './OrderStatusMapper';
import { OrderItemDto } from '../dto/OrderItemDto';

/**
 * OrderMapper is responsible for mapping between Order domain entities and OrderDto DTOs.
 */
export class OrderMapper {
  /**
   * Map a domain Order to an OrderDto
   * @param order The domain Order to map
   * @param baseUrl The base URL for HATEOAS links
   * @returns The mapped OrderDto
   */
  static toDto(order: Order, baseUrl: string): OrderDto {
    const customerInfoDto: CustomerInfoDto = {
      name: order.customerInfo.name,
      taxNumber: order.customerInfo.taxNumber,
      email: order.customerInfo.email
    };

    const links: LinkDto[] = [
      {
        rel: 'self',
        href: `${baseUrl}/orders/${order.id}`,
        method: 'GET'
      },
      {
        rel: 'delete',
        href: `${baseUrl}/orders/${order.id}`,
        method: 'DELETE'
      }
    ];

    // Add status-specific links
    switch (order.status) {
      case OrderStatus.CREATED:
        links.push({
          rel: 'confirm',
          href: `${baseUrl}/orders/${order.id}/confirm`,
          method: 'POST'
        });
        links.push({
          rel: 'cancel',
          href: `${baseUrl}/orders/${order.id}/cancel`,
          method: 'POST'
        });
        break;
      case OrderStatus.CONFIRMED:
        links.push({
          rel: 'pay',
          href: `${baseUrl}/orders/${order.id}/pay`,
          method: 'POST'
        });
        links.push({
          rel: 'cancel',
          href: `${baseUrl}/orders/${order.id}/cancel`,
          method: 'POST'
        });
        break;
      case OrderStatus.PAYMENT_OF_AVANS:
        links.push({
          rel: 'start-production',
          href: `${baseUrl}/orders/${order.id}/start-production`,
          method: 'POST'
        });
        links.push({
          rel: 'cancel',
          href: `${baseUrl}/orders/${order.id}/cancel`,
          method: 'POST'
        });
        break;
      case OrderStatus.PRODUCTION_AND_PACKAGING:
        links.push({
          rel: 'start-delivery',
          href: `${baseUrl}/orders/${order.id}/start-delivery`,
          method: 'POST'
        });
        links.push({
          rel: 'cancel',
          href: `${baseUrl}/orders/${order.id}/cancel`,
          method: 'POST'
        });
        break;
      case OrderStatus.DELIVERY:
        links.push({
          rel: 'complete-billing',
          href: `${baseUrl}/orders/${order.id}/complete-billing`,
          method: 'POST'
        });
        break;
    }

    // Map order items
    const orderItemsDto: OrderItemDto[] = order.items.map(item => ({
      id: item.id.value,
      productId: item.productId.value,
      quantity: item.quantity,
      price: {
        amount: item.price.amount,
        currency: item.price.currency
      },
      total: {
        amount: item.calculateTotal().amount,
        currency: item.calculateTotal().currency
      }
    }));

    return {
      id: order.id,
      customerInfo: customerInfoDto,
      status: OrderStatusMapper.toViewOrderStatus(order.status),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: orderItemsDto,
      totalAmount: {
        amount: order.totalAmount.amount,
        currency: order.totalAmount.currency
      },
      _links: links
    };
  }

  /**
   * Map an array of domain Orders to an array of OrderDtos
   * @param orders The domain Orders to map
   * @param baseUrl The base URL for HATEOAS links
   * @returns The mapped OrderDtos
   */
  static toDtoList(orders: Order[], baseUrl: string): OrderDto[] {
    return orders.map(order => this.toDto(order, baseUrl));
  }
}
