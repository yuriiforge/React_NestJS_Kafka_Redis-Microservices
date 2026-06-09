import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { Consumer } from 'kafkajs';
import {
  KafkaTopic,
  KafkaGroup,
  OrderCreatedEvent,
  PaymentProcessedEvent,
  PaymentResult,
  OrderStatusUpdatedEvent,
  createConsumer,
} from '@ecommerce/shared';

const INDEX = 'orders';

const DELIVERY_TO_STATUS: Record<string, string> = {
  PREPARING: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
};

@Injectable()
export class SearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SearchService.name);
  private readonly client: Client;
  private ordersConsumer!: Consumer;
  private paymentsConsumer!: Consumer;
  private deliveryConsumer!: Consumer;
  private dlqConsumer!: Consumer;

  constructor(config: ConfigService) {
    this.client = new Client({
      node: config.get<string>('ELASTICSEARCH_URL', 'http://elasticsearch:9200'),
    });
  }

  async onModuleInit() {
    await this.ensureIndex();
    await this.startConsumers();
  }

  async onModuleDestroy() {
    await this.ordersConsumer?.disconnect();
    await this.paymentsConsumer?.disconnect();
    await this.deliveryConsumer?.disconnect();
    await this.dlqConsumer?.disconnect();
  }

  private async ensureIndex() {
    const exists = await this.client.indices.exists({ index: INDEX });
    if (!exists) {
      try {
        await this.client.indices.create({
          index: INDEX,
          mappings: {
            properties: {
              orderId:       { type: 'keyword' },
              userId:        { type: 'keyword' },
              status:        { type: 'keyword' },
              totalAmount:   { type: 'float' },
              itemCount:     { type: 'integer' },
              itemNames:     { type: 'text' },
              courier:       { type: 'text' },
              paymentStatus: { type: 'keyword' },
              processedAt:   { type: 'date' },
              createdAt:     { type: 'date' },
            },
          },
        });
        this.logger.log(`Created index: ${INDEX}`);
      } catch (err: any) {
        if (err?.meta?.statusCode !== 400) throw err;
      }
    }
  }

  private async startConsumers() {
    this.ordersConsumer = await createConsumer(
      KafkaGroup.SEARCH_ORDERS,
      [KafkaTopic.ORDERS],
      async ({ message }) => {
        const event: OrderCreatedEvent = JSON.parse(message.value!.toString());
        await this.handleOrderCreated(event);
      },
    );

    this.paymentsConsumer = await createConsumer(
      KafkaGroup.SEARCH_PAYMENTS,
      [KafkaTopic.PAYMENTS],
      async ({ message }) => {
        const event: PaymentProcessedEvent = JSON.parse(message.value!.toString());
        await this.handlePayment(event);
      },
    );

    this.deliveryConsumer = await createConsumer(
      KafkaGroup.SEARCH_DELIVERY,
      [KafkaTopic.ORDER_STATUS_UPDATED],
      async ({ message }) => {
        const event: OrderStatusUpdatedEvent = JSON.parse(message.value!.toString());
        await this.handleStatusUpdate(event);
      },
    );

    this.dlqConsumer = await createConsumer(
      KafkaGroup.SEARCH_DLQ,
      [KafkaTopic.ORDERS_DLQ],
      async ({ message }) => {
        const payload = JSON.parse(message.value!.toString());
        await this.handleDLQ(payload);
      },
    );

    this.logger.log('Kafka consumers ready');
  }

  private async handleOrderCreated(event: OrderCreatedEvent) {
    await this.client.index({
      index: INDEX,
      id: event.orderId,
      document: {
        orderId:       event.orderId,
        userId:        event.userId,
        status:        'PENDING',
        totalAmount:   event.totalAmount,
        itemCount:     event.items.length,
        itemNames:     event.items.map((i) => i.name).join(' '),
        courier:       null,
        paymentStatus: null,
        processedAt:   null,
        createdAt:     event.createdAt,
      },
    });
    this.logger.log(`Indexed order: ${event.orderId}`);
  }

  private async handlePayment(event: PaymentProcessedEvent) {
    try {
      await this.client.update({
        index: INDEX,
        id: event.orderId,
        doc: {
          paymentStatus: event.status,
          processedAt:   event.processedAt,
          ...(event.status === PaymentResult.FAILED && { status: 'FAILED' }),
        },
      });
      this.logger.log(`Payment update: ${event.orderId} → ${event.status}`);
    } catch (err: any) {
      this.logger.warn(`Could not update payment for order ${event.orderId}: ${err.message}`);
    }
  }

  private async handleStatusUpdate(event: OrderStatusUpdatedEvent) {
    try {
      await this.client.update({
        index: INDEX,
        id: event.orderId,
        doc: {
          status:  DELIVERY_TO_STATUS[event.status] ?? event.status,
          courier: event.courier,
        },
      });
      this.logger.log(`Status update: ${event.orderId} → ${event.status}`);
    } catch (err: any) {
      this.logger.warn(`Could not update status for order ${event.orderId}: ${err.message}`);
    }
  }

  private async handleDLQ(payload: Record<string, unknown>) {
    const original = payload.originalMessage as Record<string, unknown> | undefined;
    if (!original) return;

    let orderId: string | undefined;
    if (typeof original.orderId === 'string') {
      orderId = original.orderId;
    } else if (typeof original.value === 'string') {
      try {
        const parsed = JSON.parse(original.value);
        orderId = parsed.orderId;
      } catch { /* ignore */ }
    }

    if (!orderId) return;

    try {
      await this.client.update({
        index: INDEX,
        id: orderId,
        doc: { status: 'payment_failed' },
      });
      this.logger.log(`DLQ: marked order ${orderId} as payment_failed`);
    } catch (err: any) {
      this.logger.warn(`Could not update DLQ status for order ${orderId}: ${err.message}`);
    }
  }

  async search(q?: string, status?: string, page = 1, limit = 10) {
    const must: object[] = [];
    const filter: object[] = [];

    if (q?.trim()) {
      must.push({
        multi_match: {
          query:     q,
          fields:    ['orderId^3', 'userId', 'itemNames', 'courier'],
          fuzziness: 'AUTO',
        },
      });
    }

    if (status) {
      filter.push({ term: { status } });
    }

    const result = await this.client.search({
      index: INDEX,
      from:  (page - 1) * limit,
      size:  limit,
      query: (must.length || filter.length)
        ? { bool: { ...(must.length && { must }), ...(filter.length && { filter }) } }
        : { match_all: {} },
      sort: [{ createdAt: { order: 'desc' } }],
    });

    const total =
      typeof result.hits.total === 'object'
        ? result.hits.total.value
        : (result.hits.total ?? 0);

    return {
      items:      result.hits.hits.map((h) => h._source),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOrder(orderId: string) {
    try {
      const result = await this.client.get({ index: INDEX, id: orderId });
      return result._source ?? null;
    } catch {
      return null;
    }
  }

  async getStats() {
    const result = await this.client.search({
      index: INDEX,
      size:  0,
      aggs: {
        by_status: {
          terms: { field: 'status', size: 20 },
        },
        total_revenue: {
          sum: { field: 'totalAmount' },
        },
        by_payment: {
          terms: { field: 'paymentStatus', size: 5 },
        },
      },
    });

    const aggs = result.aggregations as Record<string, any>;
    const byStatus:  { key: string; doc_count: number }[] = aggs?.by_status?.buckets  ?? [];
    const byPayment: { key: string; doc_count: number }[] = aggs?.by_payment?.buckets ?? [];

    const total =
      typeof result.hits.total === 'object'
        ? result.hits.total.value
        : (result.hits.total ?? 0);

    return {
      total,
      totalRevenue: Math.round((aggs?.total_revenue?.value ?? 0) * 100) / 100,
      byStatus:  Object.fromEntries(byStatus.map((b)  => [b.key, b.doc_count])),
      byPayment: Object.fromEntries(byPayment.map((b) => [b.key, b.doc_count])),
    };
  }
}
