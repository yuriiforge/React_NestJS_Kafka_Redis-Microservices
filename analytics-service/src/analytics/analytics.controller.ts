import { Controller } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  KafkaTopic,
  OrderCreatedEvent,
  PaymentProcessedEvent,
  OrderStatusUpdatedEvent,
} from '@ecommerce/shared';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  handleOrderCreated(event: OrderCreatedEvent) {
    return this.analyticsService.trackOrderCreated(event);
  }

  handlePaymentProcessed(event: PaymentProcessedEvent) {
    return this.analyticsService.trackPaymentProcessed(event);
  }

  handleOrderStatusUpdated(event: OrderStatusUpdatedEvent) {
    return this.analyticsService.trackOrderStatusUpdated(event);
  }
}

export { KafkaTopic };
