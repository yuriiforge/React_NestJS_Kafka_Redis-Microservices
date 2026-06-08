export enum OrderDeliveryStatus {
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}

export interface OrderStatusUpdatedEvent {
  orderId: string;
  status: OrderDeliveryStatus;
  courier: string;
  updatedAt: string;
}
