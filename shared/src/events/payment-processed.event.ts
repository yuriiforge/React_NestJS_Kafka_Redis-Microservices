export enum PaymentResult {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface PaymentProcessedEvent {
  paymentId: string;
  orderId: string;
  status: PaymentResult;
  processedAt: string;
  failureReason: string | null;
}
