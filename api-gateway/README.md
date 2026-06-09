# API Gateway

HTTP reverse proxy and JWT authentication middleware. Single entry point for all frontend API requests.

**Port:** `8000`

## Route Mapping

| Path prefix | Proxied to | Auth required |
|---|---|---|
| `/api/auth` | auth-service:3006 | No |
| `/api/products` | product-service:3007 | Yes (Bearer) |
| `/api/orders` | order-service:3001 | Yes (Bearer) |
| `/api/payments` | payment-service:3002 | Yes (Bearer) |
| `/api/deliveries` | delivery-service:3003 | Yes (Bearer) |
| `/api/analytics` | analytics-service:3004 | Yes (Bearer) |
| `/api/search` | search-service:3005 | Yes (Bearer) |
| `/metrics` | — | No |

## Swagger Aggregator

The gateway exposes a unified Swagger UI at `/docs` that pulls specs from all downstream services:

| Path | Source |
|---|---|
| `/docs/auth-spec` | auth-service:3006/docs-json |
| `/docs/products-spec` | product-service:3007/docs-json |
| `/docs/orders-spec` | order-service:3001/docs-json |
| `/docs/payments-spec` | payment-service:3002/docs-json |
| `/docs/deliveries-spec` | delivery-service:3003/docs-json |
| `/docs/analytics-spec` | analytics-service:3004/docs-json |
| `/docs/search-spec` | search-service:3005/docs-json |

## Authentication Flow

1. Request arrives with `Authorization: Bearer <token>`
2. `JwtMiddleware` validates the token against `JWT_SECRET`
3. If valid, `x-user-id` and `x-user-role` headers are injected and the request is forwarded
4. If invalid/missing, `401 Unauthorized` is returned before reaching any downstream service
5. `/api/auth/*` is excluded from JWT validation (public routes)

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `8000`) |
| `JWT_SECRET` | Must match the secret used by auth-service |
| `CLIENT_URL` | CORS allowed origin |

## Key Files

```
src/
├── app.controller.ts    # Proxy handlers for all routes
├── app.module.ts        # Module with HttpModule and route config
└── jwt.middleware.ts    # JWT validation middleware
```

## Commands

```bash
npm run start:dev    # dev server with watch
npm run build        # compile to dist/
```
