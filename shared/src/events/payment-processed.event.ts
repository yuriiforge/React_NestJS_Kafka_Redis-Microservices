export interface PaymentProcessedEvent {
  paymentId: string;
  orderId: string;
  status: 'SUCCESS' | 'FAILED';
  processedAt: string;
  failureReason: string | null;
}
