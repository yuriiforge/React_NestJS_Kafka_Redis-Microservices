# Payment Service

Processes payments triggered by new orders. Consumes order events from Kafka, simulates payment processing, and publishes the result back to Kafka.

**Port:** `3002`

## Endpoints

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/payments/:orderId` | Any | Get payment record for an order |
| GET | `/metrics` | — | Prometheus metrics |

Swagger UI: `http://localhost:3002/docs`

## Payment Processing Logic

1. Listens to the `orders` Kafka topic for new `OrderCreatedEvent`
2. Creates a `Payment` record in PostgreSQL with status `PENDING`
3. Simulates payment with **80% success rate**
4. On **success**: updates Payment to `COMPLETED`, publishes `PaymentResult.SUCCESS` to `payments` topic
5. On **failure**: publishes `PaymentResult.FAILED` to `payments` topic, publishes original message to `orders.DLQ`
6. Uses `withRetry()` (3 retries with exponential backoff) before marking as failed

## Kafka

### Consumes

| Topic | Group | Action |
|---|---|---|
| `orders` | `payment-service` | Triggers payment processing for each new order |

### Produces

| Topic | Event | When |
|---|---|---|
| `payments` | `PaymentProcessedEvent` | After every payment attempt (success or failure) |
| `orders.DLQ` | Dead letter | When payment fails after all retries |

## Payment Status

```
PENDING → COMPLETED  (success)
PENDING → FAILED     (failure after retries)
```

## Metrics

`payments_processed_total{result}` — counter with labels `result=success` and `result=failed`.

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `3002`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `KAFKA_BROKERS` | Comma-separated Kafka broker addresses |

## Key Files

```
src/
└── payment/
    ├── payment.module.ts
    ├── payment.controller.ts    # GET /payments/:orderId
    └── payment.service.ts       # Kafka consumer + processing logic
```

## Commands

```bash
npm run start:dev    # dev server with watch
npm run build        # compile to dist/
npm run test         # unit tests
```
