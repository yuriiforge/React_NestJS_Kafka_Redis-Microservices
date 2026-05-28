export interface PaymentCompletedEvent {
  orderId: string;
  userId: string;
  totalPrice: number;
  paidAt: Date;
}
