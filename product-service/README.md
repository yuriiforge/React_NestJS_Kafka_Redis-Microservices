# Product Service

Product catalog management — CRUD operations with search, category filtering, and pagination.

**Port:** `3007`

## Endpoints

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/products` | Any | List products (paginated, filterable) |
| GET | `/products/:id` | Any | Get single product by ID |
| POST | `/products` | ADMIN | Create new product |
| PATCH | `/products/:id` | ADMIN | Update product |
| DELETE | `/products/:id` | ADMIN | Delete product |
| GET | `/metrics` | — | Prometheus metrics |

Swagger UI: `http://localhost:3007/docs`

### Query Parameters for `GET /products`

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default `1`) |
| `limit` | number | Items per page (default `20`) |
| `search` | string | Case-insensitive search on name and description |
| `category` | string | Filter by category (Electronics, Sports, Home, Accessories) |

## Data Model

```
Product {
  id          String   (UUID)
  name        String
  description String
  price       Float
  stock       Int
  category    String
  isActive    Boolean
  createdAt   DateTime
  updatedAt   DateTime
}
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `3007`) |
| `DATABASE_URL` | PostgreSQL connection string |

## Key Files

```
src/
└── product/
    ├── product.module.ts
    ├── product.controller.ts    # Route handlers
    ├── product.service.ts       # findAll, findOne, create, update, remove
    └── dto/
        ├── create-product.dto.ts
        ├── update-product.dto.ts
        └── query-product.dto.ts
```

## Commands

```bash
npm run start:dev    # dev server with watch
npm run build        # compile to dist/
npm run test         # unit tests
```
