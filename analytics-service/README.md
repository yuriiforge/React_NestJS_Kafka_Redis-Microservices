# Analytics Service

Provides real-time and all-time order/payment statistics. Listens to Kafka events, maintains an in-memory sliding window, and indexes events to Elasticsearch.

**Port:** `3004`

## Endpoints

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/analytics/stats` | ADMIN | Get live + all-time statistics |
| GET | `/metrics` | — | Prometheus metrics |

Swagger UI: `http://localhost:3004/docs`

### `GET /analytics/stats`

Query parameter: `window` (seconds, default `60`) — controls the live stats window size.

**Response:**

```json
{
  "live": {
    "ordersCount": 12,
    "successCount": 10,
    "failedCount": 2,
    "deliveredCount": 8,
    "windowRevenue": 1450.00,
    "successRate": 83.3,
    "avgPaymentTimeSeconds": 1.2
  },
  "allTime": {
    "allTimeOrders": 342,
    "allTimeRevenue": 48230.50,
    "avgOrderValue": 141.02
  }
}
```

## Kafka

### Consumes

| Topic | Group | Action |
|---|---|---|
| `payments` | `analytics-service-payments` | Indexes payment event to ES, adds to in-memory window |
| `order.status.updated` | `analytics-service-delivery` | Indexes delivery event to ES, adds to in-memory window |

## In-Memory Sliding Window

Payment and delivery records are stored in memory with a timestamp. When `getStats()` is called, records older than `window` seconds are pruned before computing live metrics. This gives near-instant live stats without a database query for every request.

All-time stats (`allTimeOrders`, `allTimeRevenue`) come from a direct PostgreSQL aggregation query.

## Elasticsearch

Events are indexed for historical analysis and future Kibana dashboards. The Elasticsearch service creates indices on startup.

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `3004`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `KAFKA_BROKERS` | Comma-separated Kafka broker addresses |
| `ELASTICSEARCH_URL` | Elasticsearch URL (default `http://elasticsearch:9200`) |

## Key Files

```
src/
├── analytics/
│   ├── analytics.module.ts
│   ├── analytics.controller.ts    # GET /analytics/stats
│   └── analytics.service.ts       # Kafka consumers, window logic, stats
└── elasticsearch/
    └── elasticsearch.service.ts   # ES indexing
```

## Commands

```bash
npm run start:dev    # dev server with watch
npm run build        # compile to dist/
```
