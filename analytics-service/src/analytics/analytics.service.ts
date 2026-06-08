import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { KafkaTopic, OrderCreatedEvent, PaymentCompletedEvent, DeliveryStartedEvent } from '@ecommerce/shared';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly es: ElasticsearchService) {}

  async trackOrderCreated(event: OrderCreatedEvent) {
    await this.es.indexEvent(KafkaTopic.ORDER_CREATED, {
      orderId:    event.orderId,
      userId:     event.userId,
      totalPrice: event.totalPrice,
      itemCount:  event.items.length,
      createdAt:  event.createdAt,
    });

    this.logger.log(`Tracked order.created for order ${event.orderId}`);
  }

  async trackPaymentCompleted(event: PaymentCompletedEvent) {
    await this.es.indexEvent(KafkaTopic.PAYMENT_COMPLETED, {
      orderId:    event.orderId,
      userId:     event.userId,
      totalPrice: event.totalPrice,
      paidAt:     event.paidAt,
    });

    this.logger.log(`Tracked payment.completed for order ${event.orderId}`);
  }

  async trackDeliveryStarted(event: DeliveryStartedEvent) {
    await this.es.indexEvent(KafkaTopic.DELIVERY_STARTED, {
      orderId:             event.orderId,
      userId:              event.userId,
      deliveryId:          event.deliveryId,
      estimatedDeliveryAt: event.estimatedDeliveryAt,
      startedAt:           event.startedAt,
    });

    this.logger.log(`Tracked delivery.started for order ${event.orderId}`);
  }
}
