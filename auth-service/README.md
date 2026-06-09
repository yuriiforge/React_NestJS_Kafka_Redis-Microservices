# Auth Service

Handles user registration, login, JWT token issuance, and session management via Redis.

**Port:** `3006`

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create new user account |
| POST | `/auth/login` | Public | Login, returns access + refresh tokens |
| POST | `/auth/refresh` | Public | Exchange refresh token for new access token |
| POST | `/auth/logout` | Bearer | Revoke current session |
| GET | `/auth/me` | Bearer | Get current user profile |
| GET | `/metrics` | — | Prometheus metrics |

Swagger UI: `http://localhost:3006/docs`

## Token Flow

1. Login returns `{ accessToken, refreshToken }`
2. `accessToken` — short-lived JWT, sent as `Authorization: Bearer <token>` on every request
3. `refreshToken` — stored in Redis with a TTL, used once to issue a new access token
4. Logout revokes the refresh token from Redis immediately

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `3006`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign and verify JWTs |
| `REDIS_HOST` | Redis hostname (default `redis`) |
| `REDIS_PORT` | Redis port (default `6379`) |
| `BCRYPT_SALT_ROUNDS` | bcrypt rounds for password hashing (default `10`) |
| `CLIENT_URL` | CORS allowed origin |

## Dependencies

- **PostgreSQL** — stores User records (via shared Prisma client)
- **Redis** — stores refresh tokens and enables revocation on logout

## Key Files

```
src/
├── auth/
│   ├── auth.controller.ts       # Route handlers
│   ├── auth.service.ts          # login, register, getMe, logout
│   └── token/
│       └── token.service.ts     # JWT sign/verify/revoke via Redis
└── redis/
    └── redis.module.ts          # Redis connection provider
```

## Commands

```bash
npm run start:dev    # dev server with watch
npm run build        # compile to dist/
npm run test         # unit tests
npm run test:e2e     # e2e tests
```
