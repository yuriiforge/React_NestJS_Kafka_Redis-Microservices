# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Monorepo with two independent apps:

- `backend/` — NestJS 11 REST API (TypeScript, CommonJS)
- `frontend/` — React 19 + Vite 8 SPA (TypeScript, ESM)

---

## Backend (`backend/`)

### Commands

```bash
npm run start:dev       # dev server with watch
npm run build           # compile to dist/
npm run start:prod      # run compiled dist/main.js
npm run lint            # ESLint with auto-fix
npm run test            # unit tests
npm run test:watch      # unit tests in watch mode
npm run test:cov        # unit tests with coverage
npm run test:e2e        # e2e tests (test/jest-e2e.json config)
```

### Architecture

- Entry: `src/main.ts` — bootstraps on `PORT` env var (default 3000)
- Root module: `src/app.module.ts`
- No database layer configured yet — add TypeORM/Prisma/Mongoose modules to `app.module.ts` when needed
- E2E tests use Supertest against the full NestJS app (`test/app.e2e-spec.ts`)
- ESLint config: `eslint.config.mjs` — TypeScript ESLint, no Prettier integration (removed)

---

## Frontend (`frontend/`)

### Commands

```bash
npm run dev             # Vite dev server
npm run build           # tsc + Vite production build
npm run lint            # ESLint
npm run preview         # preview production build
```

### Architecture

- Entry: `src/main.tsx` → `src/App.tsx`
- Path alias `@/` resolves to `src/` (configured in both `tsconfig.app.json` and `vite.config.ts`)
- UI components live in `src/components/ui/` — these are shadcn/ui components (do not edit manually; use `npx shadcn@canary add <component>` to add new ones)
- `src/lib/utils.ts` exports `cn()` — use this for all Tailwind class merging
- Pages go in `src/pages/`

### Key libraries

| Library | Purpose |
|---|---|
| React Router DOM 7 | Client-side routing |
| Zustand 5 | Global state management |
| Axios | HTTP requests to backend |
| Formik + Yup | Form state and validation |
| Recharts | Charts and data visualization |
| shadcn/ui + Tailwind v4 | Component library and styling |
| Lucide React | Icons |

### shadcn/ui

Uses the **radix-nova** style with Lucide icons. Config is in `frontend/components.json`. To add components:

```bash
npx shadcn@canary add <component>
```

Use `shadcn@canary` — the stable `@latest` CLI does not support the Tailwind v4 setup used here.
