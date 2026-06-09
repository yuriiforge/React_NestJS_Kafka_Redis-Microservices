import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer } from 'kafkajs';
import {
  prisma,
  KafkaTopic,
  KafkaGroup,
  PaymentResult,
  PaymentProcessedEvent,
  OrderStatusUpdatedEvent,
  OrderDeliveryStatus,
  createConsumer,
} from '@ecommerce/shared';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

interface PaymentRecord {
  orderId: string;
  amount: number;
  status: PaymentResult;
  processedAt: number;
  paymentTimeMs: number;
}

interface DeliveryRecord {
  orderId: string;
  status: OrderDeliveryStatus;
  updatedAt: number;
}

@Injectable()
export class AnalyticsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AnalyticsService.name);
  private paymentsConsumer!: Consumer;
  private deliveryConsumer!: Consumer;

  private payments: PaymentRecord[] = [];
  private deliveries: DeliveryRecord[] = [];

  constructor(private readonly es: ElasticsearchService) {}

  async onModuleInit() {
    this.paymentsConsumer = await createConsumer(
      KafkaGroup.ANALYTICS_PAYMENTS,
      [KafkaTopic.PAYMENTS],
      async ({ message }) => {
        const event: PaymentProcessedEvent = JSON.parse(
          message.value!.toString(),
        );
        await this.handlePayment(event);
      },
    );

    this.deliveryConsumer = await createConsumer(
      KafkaGroup.ANALYTICS_DELIVERY,
      [KafkaTopic.ORDER_STATUS_UPDATED],
      async ({ message }) => {
        const event: OrderStatusUpdatedEvent = JSON.parse(
          message.value!.toString(),
        );
        await this.handleDelivery(event);
      },
    );

    this.logger.log('Kafka consumers ready');
  }

  async onModuleDestroy() {
    await this.paymentsConsumer?.disconnect();
    await this.deliveryConsumer?.disconnect();
  }

  private async handlePayment(event: PaymentProcessedEvent) {
    const order = await prisma.order.findUnique({
      where: { id: event.orderId },
      select: { totalPrice: true, createdAt: true },
    });

    const amount = event.status === PaymentResult.SUCCESS ? (order?.totalPrice ?? 0) : 0;
    const paymentTimeMs = order?.createdAt
      ? Date.now() - new Date(order.createdAt).getTime()
      : 0;

    this.payments.push({
      orderId: event.orderId,
      amount,
      status: event.status,
      processedAt: Date.now(),
      paymentTimeMs,
    });

    await this.es.indexEvent('payment', {
      orderId: event.orderId,
      paymentId: event.paymentId,
      status: event.status,
      failureReason: event.failureReason,
    });

    this.logger.log(`Payment tracked: ${event.orderId} → ${event.status}`);
  }

  private async handleDelivery(event: OrderStatusUpdatedEvent) {
    this.deliveries.push({
      orderId: event.orderId,
      status: event.status,
      updatedAt: Date.now(),
    });

    await this.es.indexEvent('delivery', {
      orderId: event.orderId,
      status: event.status,
      courier: event.courier,
    });

    this.logger.log(`Delivery tracked: ${event.orderId} → ${event.status}`);
  }

  async getStats(windowSeconds = 60) {
    const since = Date.now() - windowSeconds * 1000;

    const recentPayments = this.payments.filter((p) => p.processedAt >= since);
    const recentDeliveries = this.deliveries.filter((d) => d.updatedAt >= since);

    const successful = recentPayments.filter((p) => p.status === PaymentResult.SUCCESS);
    const failed = recentPayments.filter((p) => p.status === PaymentResult.FAILED);
    const delivered = recentDeliveries.filter((d) => d.status === OrderDeliveryStatus.DELIVERED);

    const windowRevenue = successful.reduce((sum, p) => sum + p.amount, 0);
    const successRate = recentPayments.length > 0
      ? successful.length / recentPayments.length
      : 0;

    const avgPaymentTimeMs = recentPayments.length > 0
      ? recentPayments.reduce((sum, p) => sum + p.paymentTimeMs, 0) / recentPayments.length
      : 0;

    this.prune(since);

    // All-time stats from DB
    const [totalOrders, revenueAgg] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { in: ['DELIVERED', 'CONFIRMED', 'SHIPPED'] } },
        _sum: { totalPrice: true },
      }),
    ]);

    const allTimeRevenue = revenueAgg._sum.totalPrice ?? 0;

    return {
      windowSeconds,
      // window (live) stats
      ordersCount: recentPayments.length,
      successCount: successful.length,
      failedCount: failed.length,
      deliveredCount: delivered.length,
      windowRevenue: Math.round(windowRevenue * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      avgPaymentTimeSeconds: Math.round(avgPaymentTimeMs / 1000),
      // all-time DB stats
      allTimeOrders: totalOrders,
      allTimeRevenue: Math.round(allTimeRevenue * 100) / 100,
      avgOrderValue: totalOrders > 0
        ? Math.round((allTimeRevenue / totalOrders) * 100) / 100
        : 0,
    };
  }

  private prune(since: number) {
    this.payments = this.payments.filter((p) => p.processedAt >= since);
    this.deliveries = this.deliveries.filter((d) => d.updatedAt >= since);
  }
}
