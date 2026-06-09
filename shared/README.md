# Shared Package (`@ecommerce/shared`)

Internal package shared across all microservices. Provides the Prisma client, Kafka helpers, event types, guards, and the Prometheus metrics module.

## What's Inside

### Prisma

Single Prisma client instance shared across services.

**Schema location:** `prisma/schema.prisma`

**Models:** `User`, `Order`, `OrderItem`, `Product`, `Payment`, `Delivery`

**Enums:**
- `Role`: `USER`, `ADMIN`
- `OrderStatus`: `PENDING`, `CONFIRMED`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `FAILED`
- `PaymentStatus`: `PENDING`, `COMPLETED`, `FAILED`
- `DeliveryStatus`: `ASSIGNED`, `IN_TRANSIT`, `DELIVERED`, `FAILED`

To create a new migration after editing the schema:

```bash
npx prisma migrate dev --schema=prisma/schema.prisma --name describe_change
```

To apply migrations in production:

```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

### Kafka

**Topics** (`src/events/kafka-topics.enum.ts`):

| Enum value | Topic name |
|---|---|
| `ORDERS` | `orders` |
| `PAYMENTS` | `payments` |
| `ORDER_STATUS_UPDATED` | `order.status.updated` |
| `ORDERS_DLQ` | `orders.DLQ` |
| `ORDER_STATS` | `order-stats` |

**Consumer Groups** (`src/events/kafka-groups.enum.ts`):

| Enum value | Group name | Consumer |
|---|---|---|
| `PAYMENT_SERVICE` | `payment-service` | Payment Service |
| `DELIVERY_SERVICE` | `delivery-service` | Delivery Service |
| `ORDER_SERVICE_STATUS` | `order-service-status` | Order Service |
| `ORDER_SERVICE_PAYMENTS` | `order-service-payments` | Order Service |
| `ANALYTICS_PAYMENTS` | `analytics-service-payments` | Analytics Service |
| `ANALYTICS_DELIVERY` | `analytics-service-delivery` | Analytics Service |
| `SEARCH_ORDERS` | `search-service-orders` | Search Service |
| `SEARCH_PAYMENTS` | `search-service-payments` | Search Service |
| `SEARCH_DELIVERY` | `search-service-delivery` | Search Service |
| `SEARCH_DLQ` | `search-service-dlq` | Search Service |

**Event types** (`src/events/`):
- `OrderCreatedEvent` — published to `orders` topic
- `PaymentProcessedEvent` — published to `payments` topic
- `OrderStatusUpdatedEvent` — published to `order.status.updated` topic
- `OrderStatsEvent` — published to `order-stats` topic

**Kafka helpers** (`src/kafka/client.ts`):
- `createProducer()` — creates and connects a KafkaJS producer
- `createConsumer(group, topics, handler)` — creates, subscribes, and starts a consumer
- `withRetry(fn, retries, backoff)` — retries an async function with exponential backoff
- `publishToDLQ(producer, message)` — publishes a message to the DLQ topic

### Guards & Decorators

- `AuthGuard` — verifies `x-user-id` header injected by the gateway; returns 401 if missing
- `AdminGuard` — extends AuthGuard; returns 403 if `x-user-role` is not `ADMIN`
- `@CurrentUser()` — parameter decorator that extracts the `RequestUser` from the request

### MetricsModule

NestJS module that adds Prometheus metrics to any service.

```typescript
import { MetricsModule } from '@ecommerce/shared';

@Module({ imports: [MetricsModule] })
export class AppModule {}
```

Registers:
- `GET /metrics` — Prometheus text endpoint (scraped by Prometheus every 15s)
- `HttpMetricsInterceptor` — records `http_requests_total{method,route,status}` and `http_request_duration_seconds{method,route}` for every request
- Node.js default metrics (heap, event loop, GC) via `collectDefaultMetrics`

## Building

```bash
npm run build
```

This runs `tsc`. The compiled output goes to `dist/`. The Prisma generated client (`src/generated/prisma/`) must also be copied to `dist/generated/` — the Dockerfile handles this automatically.

## Exports

Everything is exported from `src/index.ts`:

```typescript
export { prisma } from './prisma';
export { MetricsModule } from './metrics/metrics.module';
export { HttpMetricsInterceptor } from './metrics/http-metrics.interceptor';
export { AuthGuard } from './guards/auth.guard';
export { AdminGuard } from './guards/admin.guard';
export { CurrentUser } from './decorators/current-user.decorator';
export { KafkaTopic } from './events/kafka-topics.enum';
export { KafkaGroup } from './events/kafka-groups.enum';
export * from './events/order-created.event';
export * from './events/payment-processed.event';
export * from './events/order-status-updated.event';
export { createProducer, createConsumer, withRetry, publishToDLQ } from './kafka/client';
export { throttlerConfig } from './config/throttler.config';
```
