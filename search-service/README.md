# Search Service

Full-text order search powered by Elasticsearch. Builds and maintains an `orders` index by consuming Kafka events, and exposes search endpoints for admins.

**Port:** `3005`

## Endpoints

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/search` | ADMIN | Search orders by text and/or status |
| GET | `/search/orders/:id` | ADMIN | Get a single order document from ES |
| GET | `/search/stats` | ADMIN | Aggregated order stats from ES |
| GET | `/metrics` | — | Prometheus metrics |

Swagger UI: `http://localhost:3005/docs`

### `GET /search`

| Param | Type | Description |
|---|---|---|
| `q` | string | Full-text query (matches orderId, userId, item names, courier) |
| `status` | string | Filter by order status |
| `page` | number | Page number (default `1`) |
| `limit` | number | Items per page (default `10`) |

Uses fuzzy matching and field boosting (`orderId^3` has highest priority).

### `GET /search/stats`

Returns aggregations from Elasticsearch:
- Orders grouped by status
- Orders grouped by payment status
- Total revenue sum

## Elasticsearch Index

**Index name:** `orders`

| Field | Type | Description |
|---|---|---|
| `orderId` | keyword | Order UUID |
| `userId` | keyword | User UUID |
| `status` | keyword | Order status (PENDING, CONFIRMED, etc.) |
| `totalAmount` | float | Order total |
| `itemCount` | integer | Number of items |
| `itemNames` | text | Space-joined item names (searched) |
| `courier` | text | Assigned courier name |
| `paymentStatus` | keyword | Payment result |
| `processedAt` | date | Payment processing timestamp |
| `createdAt` | date | Order creation timestamp |

## Kafka

### Consumes

| Topic | Group | Action |
|---|---|---|
| `orders` | `search-service-orders` | Indexes initial order document |
| `payments` | `search-service-payments` | Updates `paymentStatus` and `processedAt`; sets `status=FAILED` on payment failure |
| `order.status.updated` | `search-service-delivery` | Updates `status` and `courier` fields |
| `orders.DLQ` | `search-service-dlq` | Marks order as `payment_failed` |

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `3005`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `ELASTICSEARCH_URL` | Elasticsearch URL (default `http://elasticsearch:9200`) |
| `KAFKA_BROKER` | Single Kafka broker address |

## Key Files

```
src/
└── search/
    ├── search.module.ts
    ├── search.controller.ts    # Search endpoints
    └── search.service.ts       # ES client, Kafka consumers, index management
```

## Commands

```bash
npm run start:dev    # dev server with watch
npm run build        # compile to dist/
```
