import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, Producer } from 'kafkajs';
import {
  DeliveryStatus,
  prisma,
  KafkaTopic,
  KafkaGroup,
  PaymentResult,
  PaymentProcessedEvent,
  OrderStatusUpdatedEvent,
  OrderDeliveryStatus,
  createProducer,
  createConsumer,
} from '@ecommerce/shared';

const COURIERS = ['John Smith', 'Maria Garcia', 'Liam Brown', 'Anna Müller'];
const DELAY_SHIPPED_MS = 5_000;
const DELAY_DELIVERED_MS = 10_000;

function randomCourier(): string {
  return COURIERS[Math.floor(Math.random() * COURIERS.length)];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class DeliveryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DeliveryService.name);
  private producer!: Producer;
  private consumer!: Consumer;

  async onModuleInit() {
    this.producer = await createProducer();
    this.consumer = await createConsumer(
      KafkaGroup.DELIVERY_SERVICE,
      [KafkaTopic.PAYMENTS],
      async ({ message }) => {
        const event: PaymentProcessedEvent = JSON.parse(
          message.value!.toString(),
        );
        if (event.status === PaymentResult.SUCCESS) {
          void this.startDelivery(event);
        }
      },
    );
    this.logger.log('Kafka ready');
  }

  async onModuleDestroy() {
    await this.producer?.disconnect();
    await this.consumer?.disconnect();
  }

  private async startDelivery(event: PaymentProcessedEvent) {
    const courier = randomCourier();

    const estimatedDeliveryAt = new Date();
    estimatedDeliveryAt.setDate(estimatedDeliveryAt.getDate() + 3);

    const delivery = await prisma.delivery.create({
      data: {
        orderId: event.orderId,
        userId: (await prisma.order.findUniqueOrThrow({ where: { id: event.orderId } })).userId,
        estimatedDeliveryAt,
      },
    });

    this.logger.log(`Delivery assigned for order ${event.orderId}, courier: ${courier}`);

    await this.publishStatus(event.orderId, OrderDeliveryStatus.PREPARING, courier);

    await sleep(DELAY_SHIPPED_MS);
    await prisma.delivery.update({
      where: { id: delivery.id },
      data: { status: DeliveryStatus.IN_TRANSIT },
    });
    await this.publishStatus(event.orderId, OrderDeliveryStatus.SHIPPED, courier);

    await sleep(DELAY_DELIVERED_MS);
    await prisma.delivery.update({
      where: { id: delivery.id },
      data: { status: DeliveryStatus.DELIVERED },
    });
    await this.publishStatus(event.orderId, OrderDeliveryStatus.DELIVERED, courier);

    this.logger.log(`Delivery completed for order ${event.orderId}`);
  }

  private async publishStatus(
    orderId: string,
    status: OrderDeliveryStatus,
    courier: string,
  ) {
    const event: OrderStatusUpdatedEvent = {
      orderId,
      status,
      courier,
      updatedAt: new Date().toISOString(),
    };

    await this.producer.send({
      topic: KafkaTopic.ORDER_STATUS_UPDATED,
      messages: [{ key: orderId, value: JSON.stringify(event) }],
    });

    this.logger.log(`Order ${orderId} → ${status}`);
  }

  async findByOrderId(orderId: string) {
    return prisma.delivery.findUnique({ where: { orderId } });
  }
}
