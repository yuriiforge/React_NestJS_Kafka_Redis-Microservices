import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, Producer } from 'kafkajs';
import {
  OrderStatus,
  PaymentStatus,
  prisma,
  KafkaTopic,
  KafkaGroup,
  PaymentResult,
  OrderCreatedEvent,
  PaymentProcessedEvent,
  createProducer,
  createConsumer,
  withRetry,
  publishToDLQ,
} from '@ecommerce/shared';
import { Counter, register } from 'prom-client';

const paymentsTotal: Counter<string> =
  (register.getSingleMetric('payments_processed_total') as Counter<string>) ??
  new Counter({
    name: 'payments_processed_total',
    help: 'Payments processed by result',
    labelNames: ['result'],
  });

/** Simulated payment success rate per spec: 80% SUCCESS, 20% FAILED. */
const SUCCESS_RATE = 0.8;

@Injectable()
export class PaymentService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentService.name);
  private producer!: Producer;
  private consumer!: Consumer;

  async onModuleInit() {
    this.producer = await createProducer();
    this.consumer = await createConsumer(
      KafkaGroup.PAYMENT_SERVICE,
      [KafkaTopic.ORDERS],
      async ({ message }) => {
        const event: OrderCreatedEvent = JSON.parse(message.value!.toString());
        await this.processPayment(event);
      },
    );
    this.logger.log('Kafka ready');
  }

  async onModuleDestroy() {
    await this.producer?.disconnect();
    await this.consumer?.disconnect();
  }

  private async processPayment(event: OrderCreatedEvent) {
    this.logger.log(`Processing payment for order ${event.orderId}`);

    const payment = await prisma.payment.create({
      data: {
        orderId: event.orderId,
        userId: event.userId,
        amount: event.totalAmount,
        status: PaymentStatus.PENDING,
      },
    });

    let attempts = 0;

    try {
      await withRetry(
        async () => {
          attempts++;
          // Simulate payment provider latency (1–3 s) per spec
          const delay = 1000 + Math.random() * 2000;
          await new Promise((r) => setTimeout(r, delay));
          if (Math.random() >= SUCCESS_RATE) {
            return Promise.reject(new Error('Payment declined by provider'));
          }
        },
        3,
        1000,
      );

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED },
      });

      await prisma.order.update({
        where: { id: event.orderId },
        data: { status: OrderStatus.PAID },
      });

      const successEvent: PaymentProcessedEvent = {
        paymentId: payment.id,
        orderId: event.orderId,
        status: PaymentResult.SUCCESS,
        processedAt: new Date().toISOString(),
        failureReason: null,
      };

      await this.producer.send({
        topic: KafkaTopic.PAYMENTS,
        messages: [{ key: event.orderId, value: JSON.stringify(successEvent) }],
      });

      paymentsTotal.inc({ result: 'success' });
      this.logger.log(`Payment succeeded for order ${event.orderId}`);
    } catch (err) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      const failedEvent: PaymentProcessedEvent = {
        paymentId: payment.id,
        orderId: event.orderId,
        status: PaymentResult.FAILED,
        processedAt: new Date().toISOString(),
        failureReason: err instanceof Error ? err.message : 'Unknown error',
      };

      await this.producer.send({
        topic: KafkaTopic.PAYMENTS,
        messages: [{ key: event.orderId, value: JSON.stringify(failedEvent) }],
      });

      await publishToDLQ(this.producer, event, err, attempts);

      paymentsTotal.inc({ result: 'failed' });
      this.logger.warn(
        `Payment failed for order ${event.orderId} after ${attempts} attempt(s)`,
      );
    }
  }

  async findByOrderId(orderId: string) {
    return prisma.payment.findUnique({ where: { orderId } });
  }
}
