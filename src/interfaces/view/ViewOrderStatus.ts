/**
 * ViewOrderStatus represents the order status in the view/interface layer.
 * It provides a translation key for localization in the view.
 */
export enum ViewOrderStatus {
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
  PAYMENT_OF_AVANS = 'payment_of_avans',
  PRODUCTION_AND_PACKAGING = 'production_and_packaging',
  DELIVERY = 'delivery',
  PROJECT_BILLING = 'project_billing'
}

/**
 * Get the translation key for a ViewOrderStatus value.
 * This can be used directly with the i18n system.
 */
export function getOrderStatusTranslationKey(status: ViewOrderStatus): string {
  return `status.${status}`;
}