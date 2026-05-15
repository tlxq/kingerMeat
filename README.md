# Kinger Meat

<img src="./client/public/img/logo.png" width="300" />

Online shop for wild game meat from Sörmland, Sweden.

## About

Final project for the YH backend course (F25D) at Yrkeshögskolan i Borås. The goal of the project is to demonstrate backend fundamentals end-to-end: REST API design with Express, type safety with TypeScript and Zod, relational modeling with Prisma, observability via custom startup/request logging, and graceful shutdown handling. The frontend exists to make the API usable, but the depth of the project lives in `server/`.

**Live:** [kingermeat.ttdevs.com](https://kingermeat.ttdevs.com) · **API:** [api.kingermeat.ttdevs.com](https://api.kingermeat.ttdevs.com)

---

## Preview

![Startup](./client/public/img/startup.gif)

---

## Tech stack

**Backend**

- Node.js (ESM) + Express 5 + TypeScript (strict, ES2023)
- PostgreSQL via [Neon](https://neon.tech) (serverless)
- Prisma ORM
- Zod (runtime validation of env vars, query params and path params)
- Helmet + CORS
- `kingermeat` CLI built with Commander

**Frontend**

- React 19 + TypeScript + Vite
- React Router v7
- Tailwind CSS + Framer Motion

---

## Tech choices and trade-offs

| Choice                     | Why                                           | Trade-off                                                                                                   |
| -------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Prisma over raw SQL        | Type-safe queries, schema-as-code, migrations | Extra abstraction layer; less control over raw query plans                                                  |
| Zod for validation         | One source for runtime checks and TS types    | Extra dependency; small bundle/runtime cost                                                                 |
| Neon (serverless Postgres) | Free tier, branching, autoscale               | Cold starts (~5s) after idle — handled by `ColdStartLoader` on the client (20s timeout, 3 retries, backoff) |
| Render                     | Backend and static frontend on one platform   | Free tier sleeps; first request after idle is slow                                                          |
| No automated tests         | Scope/time constraint within the course       | Manual verification via `kingermeat doctor` (env, db, schema, routes)                                       |

---

## Architecture

```
Client (React 19 / Vite)
        │
        │  HTTPS / JSON
        ▼
   Express API ──── Zod (validation)
        │
        │  Prisma Client
        ▼
   Postgres (Neon, serverless)
```

Inside `server/` the layers are kept separate:

- `routes/` — URL → controller mapping, no logic
- `controllers/` — request handling and database access
- `middleware/` — Express-specific (error handler, request logger)
- `lib/` — framework-agnostic utilities (logging, env validation, custom errors, startup log)

---

## Project structure

```
kingerMeat/
├── server/       Express API
└── client/       React + Vite frontend
```

## Local development

### Requirements

- Node.js 22 or higher (the codebase uses top-level `await` and targets ES2023)
- A PostgreSQL database — a free [Neon](https://neon.tech) project works out of the box

### Backend setup

```bash
git clone git@github.com:tlxq/kingerMeat.git
cd kingerMeat/server
npm install
cp .env.example .env
```

Fill in `.env` (see table below), then run migrations and seed:

```bash
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

**Server environment variables**

| Variable       | Required | Default                 | Description                           |
| -------------- | -------- | ----------------------- | ------------------------------------- |
| `DATABASE_URL` | yes      | —                       | Postgres connection string from Neon  |
| `PORT`         | no       | `3000`                  | HTTP port                             |
| `NODE_ENV`     | no       | `development`           | `development` / `production` / `test` |
| `CORS_ORIGIN`  | no       | `http://localhost:5173` | Allowed frontend origin               |

All four are validated by Zod at startup — a missing or malformed value crashes the process with a precise error message instead of failing later at runtime.

### CLI

The project ships with `kingermeat`, a CLI for running the server and probing the API from the same terminal.

```bash
cd server && npm link
```

![Help](./client/public/img/help.gif)

Run a full health check — verifies env, database connection, Prisma schema and every API route in one command:

```bash
kingermeat doctor
```

What `doctor` verifies:

- Environment variables are present and pass Zod validation
- Database connection (with measured latency in ms)
- Prisma schema validates (`npx prisma validate`)
- All five API routes respond (`/health`, `/api/ping`, `/api/stats`, `/api/products`, `/api/categories`)

![Doctor](./client/public/img/doctor.gif)

### Frontend setup

```bash
cd kingerMeat/client
npm install
cp .env.example .env
npm run dev
```

**Client environment variables**

| Variable       | Required | Default | Description                             |
| -------------- | -------- | ------- | --------------------------------------- |
| `VITE_API_URL` | yes      | —       | URL the frontend calls for API requests |

For production, `.env.production` is picked up automatically by Vite during build.

---

## API reference

### Health and status

| Method | Path         | Status    | Description                                   |
| ------ | ------------ | --------- | --------------------------------------------- |
| GET    | `/health`    | 200 / 503 | Server status + database ping with latency    |
| GET    | `/api/ping`  | 200       | Lightweight liveness check                    |
| GET    | `/api/stats` | 200       | Total products, categories and stock quantity |

<details>
<summary>Example responses</summary>

```json
// GET /health
{ "status": "ok", "db": "ok", "env": "production", "uptime": 124.3, "timestamp": "2026-05-13T09:12:44.110Z" }

// GET /api/stats
{ "totalProducts": 6, "totalCategories": 3, "totalStock": 112 }
```

</details>

### Products

| Method | Path                          | Status          | Description                                            |
| ------ | ----------------------------- | --------------- | ------------------------------------------------------ |
| GET    | `/api/products`               | 200             | All products with their category                       |
| GET    | `/api/products?category=slug` | 200             | Filter by category slug                                |
| GET    | `/api/products/:id`           | 200 / 400 / 404 | Single product — 400 if `id` is not a positive integer |

<details>
<summary>Example response</summary>

```json
// GET /api/products/1
{
  "id": 1,
  "name": "Hjortfilé",
  "description": "Mör och smakrik filé",
  "price": "289",
  "weightGrams": 500,
  "stockQty": 20,
  "categoryId": 1,
  "createdAt": "2026-05-10T14:54:55.000Z",
  "category": {
    "id": 1,
    "name": "Hjort",
    "slug": "hjort",
    "description": "Viltkött från hjort"
  }
}
```

</details>

### Categories

| Method | Path                  | Status          | Description                                                               |
| ------ | --------------------- | --------------- | ------------------------------------------------------------------------- |
| GET    | `/api/categories`     | 200             | All categories with product counts                                        |
| GET    | `/api/categories/:id` | 200 / 400 / 404 | Single category with its products — 400 if `id` is not a positive integer |

<details>
<summary>Example response</summary>

```json
// GET /api/categories
[
  {
    "id": 1,
    "name": "Hjort",
    "slug": "hjort",
    "description": "Viltkött från hjort",
    "_count": { "products": 2 }
  },
  {
    "id": 2,
    "name": "Älg",
    "slug": "alg",
    "description": "Viltkött från älg",
    "_count": { "products": 2 }
  }
]
```

</details>

### Error responses

| Status | Body                                                | When                                                                           |
| ------ | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| 400    | `{ "error": "Validation failed", "issues": [...] }` | Zod validation failed on query/path params                                     |
| 404    | `{ "error": "..." }`                                | Resource not found or unknown route                                            |
| 500    | `{ "error": "Internal server error" }`              | Unhandled error — stack trace logged on the server, not returned to the client |

---

## Database

PostgreSQL hosted on [Neon](https://neon.tech). Two tables, related as `Category 1 ─── * Product`:

**Category**

| Field         | Type           | Notes                           |
| ------------- | -------------- | ------------------------------- |
| `id`          | `Int`          | `@id @default(autoincrement())` |
| `name`        | `VarChar(100)` |                                 |
| `slug`        | `VarChar(100)` | `@unique`                       |
| `description` | `Text?`        | optional                        |

**Product**

| Field         | Type             | Notes                                    |
| ------------- | ---------------- | ---------------------------------------- |
| `id`          | `Int`            | `@id @default(autoincrement())`          |
| `name`        | `VarChar(200)`   |                                          |
| `description` | `Text?`          | optional                                 |
| `price`       | `Decimal(10, 2)` | Decimal to avoid float rounding on money |
| `weightGrams` | `Int`            |                                          |
| `stockQty`    | `Int`            | `@default(0)`                            |
| `categoryId`  | `Int`            | foreign key → `Category.id`              |
| `createdAt`   | `DateTime`       | `@default(now())`                        |

Migrations live in `server/prisma/migrations/`. Seed data (six products across three categories) is in `server/prisma/seed.ts`.

---

## Deployment

| Service  | Platform             | URL                            |
| -------- | -------------------- | ------------------------------ |
| Backend  | Render               | api.kingermeat.ttdevs.com      |
| Frontend | Render (static site) | kingermeat.ttdevs.com          |
| Database | Neon                 | [neon.tech](https://neon.tech) |

The backend is provisioned via [`render.yaml`](./render.yaml) (Infrastructure-as-Code) at the repo root. `DATABASE_URL` is the only env var set manually in the Render dashboard. The frontend is a Render static site — SPA routing fallback is handled by `client/public/_redirects` (`/* /index.html 200`).

---

## Tests

No automated tests are included. End-to-end verification is done manually via `kingermeat doctor`, which validates env, database connection, Prisma schema and every API route in one run. Adding automated tests (vitest for unit tests, supertest for HTTP integration) is the most obvious next step for this project.

---

## Course

Slutprojekt — Backend-programmering med Node.js (F25D), Yrkeshögskolan i Borås.

![Kinger Meat](./client/public/img/logo-glitch.gif)
