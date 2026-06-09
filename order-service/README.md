# Order Service

Manages the order lifecycle. Creates orders, listens for payment and delivery results via Kafka, and streams real-time status updates to clients via SSE.

**Port:** `3001`

## Endpoints

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/orders` | Any | List orders (users see own, admins see all) |
| GET | `/orders/:id` | Any | Get single order (enforces ownership) |
| POST | `/orders` | Any | Create a new order |
| PATCH | `/orders/:id/cancel` | Any | Cancel a PENDING order |
| GET | `/orders/:id/events` | Any | SSE stream — real-time status updates |
| GET | `/metrics` | — | Prometheus metrics |

Swagger UI: `http://localhost:3001/docs`

### Query Parameters for `GET /orders`

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default `1`) |
| `limit` | number | Items per page (default `20`) |

## Order Status Lifecycle

```
PENDING
  ├── (user cancels)    → CANCELLED
  └── (payment success) → CONFIRMED → SHIPPED → DELIVERED
      (payment failure) → FAILED
```

## Kafka

### Produces

| Topic | Event | When |
|---|---|---|
| `orders` | `OrderCreatedEvent` | New order is created |

### Consumes

| Topic | Group | Action |
|---|---|---|
| `order.status.updated` | `order-service-status` | Updates order status from delivery events (PREPARING→CONFIRMED, SHIPPED, DELIVERED) |
| `payments` | `order-service-payments` | Sets order status to FAILED when payment fails |

## Real-Time Updates (SSE)

`GET /orders/:id/events` opens a Server-Sent Events stream. The client receives a `data:` event each time the order status changes. The frontend uses this to update the UI without polling.

## Metrics

`orders_created_total` — counter incremented on each successful order creation.

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `3001`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `KAFKA_BROKERS` | Comma-separated Kafka broker addresses |

## Key Files

```
src/
└── order/
    ├── order.module.ts
    ├── order.controller.ts    # Route handlers + SSE endpoint
    └── order.service.ts       # Business logic, Kafka producer/consumers
```

## Commands

```bash
npm run start:dev    # dev server with watch
npm run build        # compile to dist/
npm run test         # unit tests
```
