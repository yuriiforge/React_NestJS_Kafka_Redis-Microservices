export interface DeliveryStartedEvent {
  orderId: string;
  userId: string;
  deliveryId: string;
  estimatedDeliveryAt: Date;
  startedAt: Date;
}
