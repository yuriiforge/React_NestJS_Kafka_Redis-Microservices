# Frontend

React 19 SPA — product shop, order management, and admin dashboard.

**Dev port:** `5173` | **Production port:** `80` (nginx)

## Pages

| Route | Access | Description |
|---|---|---|
| `/auth` | Guest only | Login / Register |
| `/` | User | Product shop with cart |
| `/product-search` | User | Full-text product search with category filter |
| `/orders` | Authenticated | My orders with status tracking |
| `/analytics` | Admin | Live stats dashboard with charts |
| `/search` | Admin | Elasticsearch order search |
| `/products` | Admin | Product CRUD management |

## Tech Stack

| Library | Purpose |
|---|---|
| React Router DOM 7 | Client-side routing |
| Zustand 5 | Global state (auth, cart, orders, analytics) |
| Axios | HTTP requests to API gateway |
| Formik + Yup | Form state and validation |
| Recharts | Analytics charts |
| shadcn/ui + Tailwind v4 | Components and styling |
| Lucide React | Icons |

## State Management (Zustand stores)

| Store | Persisted | Contents |
|---|---|---|
| `auth.store.ts` | No | `accessToken`, `role`, `isAuthenticated()`, `isAdmin()` |
| `user-cart.store.ts` | Yes (localStorage) | Cart items with stock limits, `total()`, `count()` |
| `orders.store.ts` | No | Orders list, `placeOrder()`, `subscribeToOrder()` (SSE) |
| `analytics.store.ts` | No | Live stats, history for charts, `startPolling()` (10s interval) |

## API Layer

All requests go through `/api` (proxied to the API gateway):

| File | Description |
|---|---|
| `api/axios.ts` | Axios instance with auth header + auto token refresh on 401 |
| `api/auth.api.ts` | login, register, refresh, logout, me |
| `api/products.api.ts` | list (search/category/pagination), get, create, update, remove |
| `api/orders.api.ts` | list, get, create, cancel |
| `api/search.api.ts` | orders (full-text), getOrder, stats |
| `api/analytics.api.ts` | getStats(window) |

## Cart Behaviour

- Cart is persisted to `localStorage` via Zustand persist middleware
- Adding a product sets `stock` on the cart item
- The `+` button is disabled when `quantity >= stock`
- Out-of-stock products show "Out of stock" and cannot be added

## Adding shadcn/ui Components

```bash
npx shadcn@canary add <component>
```

Use `@canary` — the stable `@latest` CLI does not support the Tailwind v4 setup.

UI components live in `src/components/ui/` — do not edit them manually.

## Commands

```bash
npm run dev        # Vite dev server (port 5173)
npm run build      # tsc + Vite production build
npm run lint       # ESLint
npm run preview    # preview production build
```

## Project Structure

```
src/
├── api/           # Axios API clients per service
├── components/
│   ├── ui/        # shadcn/ui components (auto-generated)
│   ├── orders/    # OrdersTable, OrderStatusBadge, OrdersSummary
│   └── shop/      # ProductCard, CartSidebar, ShopHeader
├── pages/         # One file per route
├── store/         # Zustand stores
├── types/         # Shared TypeScript interfaces
└── lib/
    └── utils.ts   # cn() for Tailwind class merging
```
