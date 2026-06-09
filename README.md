# E-Commerce Microservices Platform

A production-ready event-driven e-commerce backend built with NestJS microservices, React frontend, Kafka messaging, Elasticsearch, and full observability stack.

## Architecture Overview

```
Browser
  └── Port 80 ──► Frontend (nginx)
                    └── /api/* ──► API Gateway (8000)
                                    ├── /api/auth       ──► Auth Service       (3006)
                                    ├── /api/products   ──► Product Service    (3007)
                                    ├── /api/orders     ──► Order Service      (3001)
                                    ├── /api/payments   ──► Payment Service    (3002)
                                    ├── /api/deliveries ──► Delivery Service   (3003)
                                    ├── /api/analytics  ──► Analytics Service  (3004)
                                    └── /api/search     ──► Search Service     (3005)
```

## Services

| Service | Port | Description |
|---|---|---|
| [api-gateway](./api-gateway) | 8000 | HTTP reverse proxy + JWT auth middleware |
| [auth-service](./auth-service) | 3006 | Registration, login, JWT tokens, Redis session store |
| [product-service](./product-service) | 3007 | Product catalog CRUD with pagination and search |
| [order-service](./order-service) | 3001 | Order lifecycle, SSE real-time updates |
| [payment-service](./payment-service) | 3002 | Payment processing via Kafka (80% simulated success) |
| [delivery-service](./delivery-service) | 3003 | Delivery lifecycle: PREPARING → SHIPPED → DELIVERED |
| [analytics-service](./analytics-service) | 3004 | Live stats with sliding window + Elasticsearch indexing |
| [search-service](./search-service) | 3005 | Order full-text search via Elasticsearch |
| [frontend](./frontend) | 80 | React SPA — shop, orders, admin dashboard |
| [shared](./shared) | — | Shared Prisma client, Kafka helpers, metrics module |

## Kafka Event Flow

```
Order created
  └──► ORDERS topic
         ├──► Payment Service     → processes payment (80% success)
         │      └──► PAYMENTS topic
         │             ├──► Delivery Service  → assigns courier, updates status
         │             │      └──► ORDER_STATUS_UPDATED topic
         │             │             ├──► Order Service     → updates DB + SSE stream
         │             │             ├──► Analytics Service → live stats window
         │             │             └──► Search Service    → updates ES document
         │             ├──► Analytics Service → indexes payment event
         │             └──► Search Service    → updates ES document
         └──► Search Service      → indexes initial order document

Payment failure
  └──► ORDERS_DLQ topic
         └──► Search Service      → marks order as payment_failed
```

## Infrastructure

| Service | Port | Purpose |
|---|---|---|
| PostgreSQL 16 | 5432 | Primary database (users, orders, products, payments, deliveries) |
| Redis 7 | 6379 | JWT token store and revocation list |
| Kafka 7.5 | 9092 | Async event bus between services |
| Elasticsearch 8.11 | 9200 | Order search index |
| Prometheus | 9090 | Metrics scraping (all 8 services) |
| Grafana | 3000 | Dashboards — pre-provisioned ecommerce dashboard |
| Kibana | 5601 | Elasticsearch data explorer |
| Kafka UI | 8080 | Kafka topic and consumer group inspector |

## Getting Started (Local)

**Prerequisites**: Docker Desktop, Node.js 22

```bash
# Start all infrastructure and services
docker compose up --build -d

# Watch logs
docker compose logs -f

# Stop everything
docker compose down
```

App is available at `http://localhost` after ~2 minutes (Kafka and ES take time to start).

### Running a service locally (without Docker)

```bash
# 1. Start infrastructure only
docker compose up postgres redis kafka elasticsearch -d

# 2. Build and start shared package
cd shared && npm run build

# 3. Start a service
cd auth-service && npm run start:dev
```

## Database Migrations

Migrations run automatically via the `migration-runner` container on `docker compose up`. To run manually:

```bash
cd shared
npx prisma migrate deploy --schema=prisma/schema.prisma
```

To create a new migration after editing `shared/prisma/schema.prisma`:

```bash
cd shared
npx prisma migrate dev --schema=prisma/schema.prisma --name describe_your_change
```

## Production Deployment (EC2)

Deployment is fully automated via GitHub Actions on every push to `main`.

**One-time EC2 setup:**
1. Install Docker — see [EC2 setup guide](#)
2. Register a self-hosted GitHub Actions runner
3. Create `~/envs/*.env` files with service environment variables
4. Add `JWT_SECRET` to GitHub repository secrets

**Deploy:** push to `main` — the workflow builds images, starts containers, and verifies all services are running.

Access the deployed app at `http://<EC2_PUBLIC_IP>`.

## Monitoring

| URL | Service | Credentials |
|---|---|---|
| `http://localhost:3000` | Grafana | admin / admin |
| `http://localhost:9090` | Prometheus | — |
| `http://localhost:8080` | Kafka UI | — |
| `http://localhost:5601` | Kibana | — |

Grafana auto-loads the **E-Commerce Overview** dashboard on first start (provisioned from `grafana/dashboards/ecommerce.json`).

## API Documentation

Each service exposes Swagger UI at `/docs`. The gateway aggregates all specs at `http://localhost:8000/docs`.

## Project Structure

```
microservices/
├── shared/                  # Shared package (@ecommerce/shared)
│   ├── prisma/              # Database schema and migrations
│   └── src/
│       ├── events/          # Kafka topic/group enums and event types
│       ├── kafka/           # Producer/consumer factory helpers
│       ├── metrics/         # Prometheus MetricsModule
│       ├── guards/          # AuthGuard, AdminGuard
│       └── generated/       # Prisma generated client (auto-generated)
├── api-gateway/
├── auth-service/
├── product-service/
├── order-service/
├── payment-service/
├── delivery-service/
├── analytics-service/
├── search-service/
├── frontend/
├── grafana/                 # Grafana provisioning config and dashboards
├── docker-compose.yml
├── prometheus.yml
└── .github/workflows/deploy.yml
```
