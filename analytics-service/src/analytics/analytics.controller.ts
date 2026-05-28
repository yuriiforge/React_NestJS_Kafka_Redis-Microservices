import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AnalyticsService } from './analytics.service';
import { KafkaTopic } from '@ecommerce/shared/src/events/kafka-topics.enum';
import { OrderCreatedEvent } from '@ecommerce/shared/src/events/order-created.event';
import { PaymentCompletedEvent } from '@ecommerce/shared/src/events/payment-completed.event';
import { DeliveryStartedEvent } from '@ecommerce/shared/src/events/delivery-started.event';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @EventPattern(KafkaTopic.ORDER_CREATED)
  async handleOrderCreated(@Payload() event: OrderCreatedEvent) {
    await this.analyticsService.trackOrderCreated(event);
  }

  @EventPattern(KafkaTopic.PAYMENT_COMPLETED)
  async handlePaymentCompleted(@Payload() event: PaymentCompletedEvent) {
    await this.analyticsService.trackPaymentCompleted(event);
  }

  @EventPattern(KafkaTopic.DELIVERY_STARTED)
  async handleDeliveryStarted(@Payload() event: DeliveryStartedEvent) {
    await this.analyticsService.trackDeliveryStarted(event);
  }
}
