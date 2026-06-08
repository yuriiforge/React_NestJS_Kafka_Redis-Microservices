// Prisma client singleton
export { default as prisma } from './prisma';

// Generated Prisma types
export { OrderStatus, PaymentStatus, DeliveryStatus, Role } from './generated/prisma';

// Types
export type { CustomJwtPayload } from './types/jwt-payload.type';

// Guards
export { AuthGuard } from './guards/auth.guard';
export { AdminGuard } from './guards/admin.guard';

// Decorators
export { CurrentUser } from './decorators/current-user.decorator';
export type { RequestUser } from './decorators/current-user.decorator';

// Kafka topics & groups
export { KafkaTopic } from './events/kafka-topics.enum';
export { KafkaGroup } from './events/kafka-groups.enum';

// Kafka events
export type { OrderCreatedEvent } from './events/order-created.event';
export { PaymentResult } from './events/payment-processed.event';
export type { PaymentProcessedEvent } from './events/payment-processed.event';
export { OrderDeliveryStatus } from './events/order-status-updated.event';
export type { OrderStatusUpdatedEvent } from './events/order-status-updated.event';
export type { OrderStatsEvent } from './events/order-stats.event';

// Kafka client helpers
export { createProducer, createConsumer, withRetry, publishToDLQ } from './kafka/client';

// Throttler
export { throttlerConfig } from './throttler.config';
