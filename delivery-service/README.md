# Delivery Service

Manages the delivery lifecycle for successfully paid orders. Assigns a courier, then simulates progression through delivery stages by publishing status updates to Kafka.

**Port:** `3003`

## Endpoints

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/deliveries/:orderId` | Any | Get delivery record for an order |
| GET | `/metrics` | — | Prometheus metrics |

Swagger UI: `http://localhost:3003/docs`

## Delivery Flow

When a successful payment event arrives:

1. Creates a `Delivery` record in PostgreSQL with status `ASSIGNED`
2. Sets `estimatedDeliveryAt` to 3 days from now
3. Assigns a random courier from the pool: `John Smith`, `Maria Garcia`, `Liam Brown`, `Anna Müller`
4. Publishes `PREPARING` status update → waits 5 seconds
5. Publishes `SHIPPED` status update → waits 10 seconds
6. Publishes `DELIVERED` status update

Each status update is sent to the `order.status.updated` Kafka topic, which the Order Service and Search Service consume.

## Kafka

### Consumes

| Topic | Group | Action |
|---|---|---|
| `payments` | `delivery-service` | Starts delivery on `PaymentResult.SUCCESS` |

### Produces

| Topic | Event | When |
|---|---|---|
| `order.status.updated` | `OrderStatusUpdatedEvent` | On each status change (PREPARING, SHIPPED, DELIVERED) |

## Delivery Status

```
ASSIGNED → IN_TRANSIT → DELIVERED
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `3003`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `KAFKA_BROKERS` | Comma-separated Kafka broker addresses |

## Key Files

```
src/
└── delivery/
    ├── delivery.module.ts
    ├── delivery.controller.ts    # GET /deliveries/:orderId
    └── delivery.service.ts       # Kafka consumer + delivery simulation
```

## Commands

```bash
npm run start:dev    # dev server with watch
npm run build        # compile to dist/
npm run test         # unit tests
```
