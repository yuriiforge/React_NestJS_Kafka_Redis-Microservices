import { Injectable, Logger } from '@nestjs/common';
import { OrderCreatedEvent, PaymentProcessedEvent, OrderStatusUpdatedEvent } from '@ecommerce/shared';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  async trackOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(`order created: ${event.orderId} total=${event.totalAmount}`);
  }

  async trackPaymentProcessed(event: PaymentProcessedEvent) {
    this.logger.log(`payment processed: ${event.orderId} status=${event.status}`);
  }

  async trackOrderStatusUpdated(event: OrderStatusUpdatedEvent) {
    this.logger.log(`order status updated: ${event.orderId} status=${event.status}`);
  }
}
