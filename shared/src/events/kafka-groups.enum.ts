export enum KafkaGroup {
  PAYMENT_SERVICE = 'payment-service',
  DELIVERY_SERVICE = 'delivery-service',
  ORDER_SERVICE_STATUS = 'order-service-status',
  ORDER_SERVICE_PAYMENTS = 'order-service-payments',
  ANALYTICS_PAYMENTS = 'analytics-service-payments',
  ANALYTICS_DELIVERY = 'analytics-service-delivery',
  SEARCH_ORDERS = 'search-service-orders',
  SEARCH_PAYMENTS = 'search-service-payments',
  SEARCH_DELIVERY = 'search-service-delivery',
  SEARCH_DLQ = 'search-service-dlq',
}
