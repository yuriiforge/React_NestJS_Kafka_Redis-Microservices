import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { prisma, PaymentCompletedEvent, DeliveryStartedEvent, KafkaTopic } from '@ecommerce/shared';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafka: ClientKafka,
  ) {}

  async assignDelivery(event: PaymentCompletedEvent) {
    this.logger.log(`Assigning delivery for order ${event.orderId}`);

    const estimatedDeliveryAt = new Date();
    estimatedDeliveryAt.setDate(estimatedDeliveryAt.getDate() + 3);

    const delivery = await prisma.delivery.create({
      data: {
        orderId: event.orderId,
        userId: event.userId,
        estimatedDeliveryAt,
      },
    });

    const deliveryEvent: DeliveryStartedEvent = {
      orderId: event.orderId,
      userId: event.userId,
      deliveryId: delivery.id,
      estimatedDeliveryAt: delivery.estimatedDeliveryAt,
      startedAt: new Date(),
    };

    this.kafka.emit(KafkaTopic.DELIVERY_STARTED, deliveryEvent);

    this.logger.log(`Delivery assigned for order ${event.orderId}, ETA: ${estimatedDeliveryAt.toISOString()}`);
  }
}
