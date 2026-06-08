# Database

PostgreSQL via Prisma ORM. Schema and migrations live in `shared/prisma/`. All services share the same database.

---

## Environments

| | Host | Port | Database | User | Password |
|---|---|---|---|---|---|
| **Dev** | localhost | 5432 | ecommerce | postgres | postgres |
| **Test** | localhost | 5433 | ecommerce_test | postgres | postgres |

Dev DB is part of the main `docker-compose.yml`. Test DB is a separate ephemeral container (`docker-compose.test.yml`) — data is wiped on every `make test-db-down`.

---

## Makefile Commands

### Dev

```bash
make infra          # start postgres (+ kafka, redis, etc.)
make db-migrate     # run pending migrations against dev DB
make db-seed        # seed dev DB with initial data
make db-setup       # db-migrate + db-seed in one shot
```

### Test

```bash
make test-db-up       # start the test postgres container
make test-db-migrate  # run migrations against test DB
make test-db-seed     # seed test DB
make test-db-setup    # test-db-up + migrate + seed in one shot
make test-db-down     # stop and wipe the test container
```

---

## Migrations

Migrations are stored in `shared/prisma/migrations/` and managed with Prisma Migrate.

**Create a new migration** (after editing `shared/prisma/schema.prisma`):

```bash
cd shared
npx prisma migrate dev --name <migration-name>
```

This generates a new migration file and applies it to the dev DB.

**Apply existing migrations** without generating new ones (CI, prod):

```bash
cd shared
npm run migrate        # dev
npm run migrate:test   # test
```

---

## Seeds

Entry point: `shared/prisma/seed.ts` — imports and runs each seeder in order.

Individual seeders live in `shared/prisma/seeders/`:

| File | What it seeds |
|---|---|
| `users.seeder.ts` | Admin + regular user (upsert by email) |
| `products.seeder.ts` | 6 sample products (skip if any exist) |

**Run seeds:**

```bash
cd shared
npm run seed        # dev
npm run seed:test   # test
```

**Seed credentials:**

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin1234! |
| User | user@example.com | User1234! |

### Adding a new seeder

1. Create `shared/prisma/seeders/<name>.seeder.ts` and export a function that accepts `PrismaClient`:

```ts
import { PrismaClient } from '../../src/generated/prisma';

export async function seedOrders(prisma: PrismaClient) {
  // ...
}
```

2. Import and call it in `shared/prisma/seed.ts`:

```ts
import { seedOrders } from './seeders/orders.seeder';

async function main() {
  await seedUsers(prisma);
  await seedProducts(prisma);
  await seedOrders(prisma);   // ← add here
}
```

---

## Prisma Config Files

| File | Used for |
|---|---|
| `shared/prisma.config.ts` | Dev — loads `shared/.env` |
| `shared/prisma.test.config.ts` | Test — loads `shared/.env.test` |

---

## Connecting with a GUI

Any Postgres client (TablePlus, DBeaver, DataGrip, pgAdmin) works.

**Dev:**
```
Host: localhost  Port: 5432  DB: ecommerce  User: postgres  Password: postgres
```

**Test:**
```
Host: localhost  Port: 5433  DB: ecommerce_test  User: postgres  Password: postgres
```

Or via `psql`:

```bash
psql -h localhost -p 5432 -U postgres -d ecommerce       # dev
psql -h localhost -p 5433 -U postgres -d ecommerce_test  # test
```
