# Arkitekturöverblick — Kinger Meat

Monorepo med två separata Node-projekt: `server/` (Express + Prisma REST API) och `client/` (Vite/React SPA). Render deployar bara `server/`.

## 1. Övergripande arkitektur

**Mönster:** klassisk **layered/three-tier MVC-light** på servern. Lagren är tydligt separerade och beroenderiktningen går alltid uppifrån-ner:

```
HTTP request
    ↓
index.ts (app setup, middleware-kedja)
    ↓
routes/*.ts            (bara mappning path → controller)
    ↓
controllers/*.ts       (validering med zod, AppError-kast)
    ↓
db/prisma.ts (delad PrismaClient)
    ↓
PostgreSQL
```

**Request-flöde** (t.ex. `GET /api/products/3`):
1. `helmet` → `cors` → `express.json` → `requestLogger` (server/src/index.ts:30-33)
2. `productRouter` matchar `/:id` → `getProductById` (server/src/routes/products.ts:11)
3. Controller kör `parseId()` (server/src/controllers/products.ts:31) → kastar `AppError(400)` om id är skräp
4. `prisma.product.findUnique({ include: { category: true } })` → 404 om saknas
5. `res.json(...)` → `requestLogger` loggar status + ms på `res.on('finish')`
6. Fel fångas av `errorHandler` sist i kedjan (server/src/middleware/errorHandler.ts:9)

**Beroenderiktning:**
`routes → controllers → db/prisma`, samt `controllers → lib/{AppError,idSchema}`. Inga cirkulära beroenden, inget lager hoppar över ett annat. Middleware och `lib/` är "utility-lager" som alla får använda.

## 2. Mappstruktur (server/src)

| Mapp | Ansvar |
|---|---|
| `index.ts` | App-bootstrap: middleware, route-registrering, preflight, listen, graceful shutdown |
| `routes/` | Endast Express-routers som mappar HTTP-verb + path till controller-funktion. Ingen logik. |
| `controllers/` | Request-handling: zod-validering, Prisma-anrop, kasta `AppError` vid 4xx |
| `db/prisma.ts` | Singleton `PrismaClient` — undviker connection-pool-läckor |
| `middleware/` | `errorHandler` (central) + `requestLogger` |
| `lib/` | Återanvändbart: `AppError`, `env` (zod-validerad config), `idSchema`/`parseId`, `log` (picocolors-wrapper), `preflightChecks`, `startupLog` |
| `cli/` | Fristående Commander-baserat CLI (`kingermeat`) — wrapper runt API:t + `doctor`-kommando |

**Bedömning av SoC:** mycket clean. Routes är "domma", controllers gör jobbet, Prisma är inkapslat. Enda gränsfallet är att `cli/cli.ts` importerar `../index.js` för `serve`-kommandot (server/src/cli/cli.ts:106) — det är pragmatiskt, inte arkitektoniskt fel.

## 3. Tekniska val

| Område | Val | Varför troligen |
|---|---|---|
| Ramverk | **Express 5** | Default-valet i skolprojekt; v5 ger async-error-propagation utan `express-async-errors` |
| ORM | **Prisma 6** | Typad client, migrations, seed i samma verktyg. Schema-first passar enkel modell. |
| Validering | **zod 4** | Används för env, query-params (`productQuerySchema`) och id-parsing (`idSchema`). En och samma lib överallt. |
| Säkerhet | **helmet + cors** | Helmet sätter default-säkra headers; CORS-origin läses från env, ingen wildcard. |
| Rate limiting | **Finns inte** | Saknas — se §10. |
| TS | **Mycket strict** | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` (server/tsconfig.json). Ingen `any`-flykt. |
| Path aliases | Nej, relativa `.js`-suffix i imports (kravs av `nodenext` ESM) |
| Loggning | **Eget micro-logger** (`lib/log.ts`) med picocolors + TTY-detektion. Inga JSON-loggar. |
| Dev | **tsx watch** | Snabbare än `ts-node-dev`, hanterar ESM-imports rakt av |
| Bygg | `tsc` + `prisma generate` |
| CLI | **Commander 14** | Custom `formatHelp` matchar serverns startup-banner stilistiskt |
| Testning | **Saknas helt** | Inga `vitest`/`jest`-paket. Se §10. |

## 4. Datamodell

Två tabeller, en 1-N-relation. Definierad i `server/prisma/schema.prisma` och migration `server/prisma/migrations/20260510145455_init_postgresql/migration.sql`.

**Category**
- `id` `SERIAL PK`
- `name` `VARCHAR(100)`
- `slug` `VARCHAR(100) UNIQUE` — används i `?category=hjort`-filter
- `description` `TEXT?`
- `products` virtuell relation

**Product**
- `id` `SERIAL PK`
- `name` `VARCHAR(200)`
- `description` `TEXT?`
- `price` `DECIMAL(10,2)` — **medvetet val:** float skulle ge avrundningsfel på pengar, schemat dokumenterar det själv
- `weightGrams` `INT` — gram istället för decimal kg, undviker float även här
- `stockQty` `INT DEFAULT 0`
- `categoryId` `INT FK → Category.id`, `ON DELETE RESTRICT ON UPDATE CASCADE` — kategorin kan inte raderas medan produkter pekar på den
- `createdAt` `TIMESTAMP DEFAULT now()`

**Constraints:** unique på `Category.slug`, FK med RESTRICT-delete. Ingen NOT NULL utöver det Prisma redan ger.

## 5. API-endpoints

Alla är `GET`, alla read-only. Inga POST/PUT/DELETE-handlers finns.

| Method | Path | Publik? | Beskrivning |
|---|---|---|---|
| GET | `/health` | publik | DB-ping + uptime, 503 om DB nere |
| GET | `/api/ping` | publik | Bara uptime + timestamp (ingen DB) — frontend pollar denna vid cold start |
| GET | `/api/products` | publik | Alla produkter, optional `?category=<slug>` |
| GET | `/api/products/:id` | publik | En produkt + dess kategori |
| GET | `/api/categories` | publik | Lista med `_count.products` |
| GET | `/api/categories/:id` | publik | Kategori + inkluderade produkter |
| GET | `/api/stats` | publik | Räknar produkter, kategorier, totalt lager, lagervärde |
| GET | `/api/debug/slow` | **dev only** | Hänger 60s — testar shutdown-timeout |
| GET | `/api/debug/error/:code` | **dev only** | Triggar `AppError` med valfri kod |
| GET | `/api/debug/throw` | **dev only** | Triggar ohanterat `Error` → 500-gren |
| GET | `/api/debug/zod` | **dev only** | Triggar `ZodError` → 400-gren |

Debug-routern registreras endast om `NODE_ENV !== 'production'` (server/src/index.ts:47-49).

## 6. Felhantering

Centraliserad i `server/src/middleware/errorHandler.ts` (placerad sist i kedjan i index.ts:60). Tre grenar:

1. **`AppError`** → `res.status(err.statusCode).json({ error: err.message })`. Förväntade fel som 400/404.
2. **`ZodError`** → 400 med `{ error, issues: [{ path, message }] }`. Klienten får veta exakt fält.
3. **Övrigt** → 500 `{ error: 'Internal server error' }` och `log.fail` med full stack internt. **Ingen stack läcker ut.**

Express 5 propagerar `throw` ur async-handlers automatiskt, så controllers slipper `try/catch` runt allt. 404-fallback registreras precis före errorHandler (server/src/index.ts:56-58).

## 7. Säkerhet

- **helmet** för default-headers, **cors** med explicit `origin: config.CORS_ORIGIN` (env-värde, ingen `*`)
- **Body-limit 100kb** på `express.json` — stoppar stora payloads
- **Env validering** i `lib/env.ts` med zod → `process.exit(1)` vid fel = fail fast
- **Secrets:** `.env` ignoreras i `server/.gitignore`, `.env.*` i `client/.gitignore` med `!.env.example`-undantag. Server-`.gitignore` saknar däremot `!.env.example`-rad — `.env.example` slipper bara igenom för att ignore-mönstret `.env` inte är ett glob (matchar exakt). Skört men funkar.
- **Skillnad dev/prod:**
  - Debug-routes bara i dev (server/src/index.ts:47)
  - SIGINT (Ctrl+C) i dev = direkt exit, i prod = graceful shutdown (server/src/index.ts:152-159)
  - PROD-badge i loggen är röd (`bgRed`) — visuell hint att man är på riktigt
- **Det som saknas:** ingen rate limiting, ingen auth (men API:t är read-only och Render har infrastrukturskydd), ingen CSP utöver helmets default.

## 8. Driftsaspekter

- **Start lokalt:** `npm run dev` (tsx watch) eller `kingermeat serve` via CLI
- **Start prod:** `npm start` → `prisma migrate deploy && node dist/index.js` (server/package.json:13)
- **Preflight:** DB pingas FÖRE `app.listen` — servern startar aldrig utan DB (server/src/lib/preflightChecks.ts:11)
- **Graceful shutdown:** SIGTERM/SIGINT-handlers. Stänger idle keep-alive först, sen `server.close()`, sen `prisma.$disconnect()`. **10s force-exit-timeout** med `setTimeout(...).unref()` som säkerhetsnät (server/src/index.ts:120-125). Re-entry skyddas med `shuttingDown`-flagga.
- **Health checks:** två endpoints — `/health` (med DB-ping, 503 vid degraded) och `/api/ping` (utan DB, för cold-start-polling)
- **Deploy:** Render via `render.yaml`. `rootDir: server`, `DATABASE_URL` sätts manuellt i dashboarden (`sync: false`). `RENDER_GIT_COMMIT/BRANCH` används för git-info i startuploggen.

## 9. Saker som är ovanligt bra

- **Färgglad startup-banner** (server/src/lib/startupLog.ts) med klickbar OSC-8 hyperlänk, env-badge, DB-latens, alla routes automatiskt listade via reflektion av Express interna router-stack — och hela renderingen wrapped i try/catch så en trasig banner inte tar ner servern.
- **`kingermeat`-CLI** (Commander) med `doctor`-kommandot: env → DB → `prisma validate` → live route-probe, allt med samma färgsymboler som servern. (server/src/cli/cli.ts:167-240)
- **Debug-routes** specifikt designade för att testa varje gren av errorHandler — det är pedagogiskt och lätt att demoa, plus avregistreras automatiskt i prod.
- **Singleton-PrismaClient** med kommentar om connection-pool-läckor — visar att utvecklaren förstår fallgropen.
- **TS-konfigen är ovanligt strikt** för ett skolprojekt: `noUncheckedIndexedAccess` och `exactOptionalPropertyTypes` är saker även proffsprojekt slarvar med.
- **Stats-controllern** kör alla 4 DB-anrop i `Promise.all` (server/src/controllers/stats.ts:7) — inte naivt sekventiellt.
- **TTY-detektion i loggern** — ANSI-koder försvinner när loggar pipeas till fil eller Render. Många hemmabyggda loggers missar det.
- **`SELECT 1`-kommentar i preflight** — visar att man tänkt på *varför* den är billigast.

## 10. Saker att vara uppmärksam på

- **Inga tester.** Inget `vitest`/`jest`, ingen `tests/`-mapp. Allra mest synligt avbockat för ett demo-projekt men värt att flagga.
- **Ingen rate limiting.** Publik read-only API utan `express-rate-limit` — på Render gratis kan man enkelt köra slut på DB-connections med en for-loop.
- **`getAllProducts` har ingen paginering** (server/src/controllers/products.ts:13). Med dagens 6 produkter spelar det ingen roll, men det skalar inte. `?limit/?offset` eller cursor saknas.
- **`getStats` läser alla rader** för att räkna lagervärde (server/src/controllers/stats.ts:11) — borde kunna ersättas av en SQL-side aggregation (`SUM(price * stockQty)`), Decimal är dock klurigt i Prisma så valet är förståeligt.
- **`logStartup` läser Express interna `router.stack`** (server/src/lib/startupLog.ts:59) — fungerar idag, men ingen del av Express publika API. Brytrisk vid major-uppgradering. Try/catch räddar dock servern.
- **Health-controllern använder `console.error`** istället för `log.fail` (server/src/controllers/health.ts:18) — liten inkonsekvens jämfört med resten.
- **`/api/categories/:id` returnerar alla produkter i kategorin** utan limit. Samma skalningsproblem som products-listan.
- **Klient-`.env` är committad** (`client/.env` finns på disk) — kolla att den bara innehåller `VITE_API_URL` (publikt) och inga secrets. `.gitignore` försöker ignorera den men ev. redan committad historik kan ligga kvar — värt en `git log -- client/.env`-koll.
- **Server-`.gitignore` saknar `!.env.example`-undantag** — kosmetiskt, men gör att man inte kan döpa filen till `.env.local` utan att råka committa den.
- **Float-konvertering i stats:** `Number(p.price)` (server/src/controllers/stats.ts:18) tappar Decimal-precisionen. För prissummor är det OK i en visning men inte korrekt om man någonsin redovisar.
- **`process.exit(1)` i `env.ts` och `preflightChecks.ts`** — okej för server, men `cli.ts` importerar `env.ts` och triggar då samma exit om env är skräp. `doctor`-kommandot fångar det dock medvetet (server/src/cli/cli.ts:173-182).
- **Versioneringen i `package.json` är 2.3.4** trots att projektet är litet — inget fel, men antyder bumps i takt med commits snarare än semver-disciplin.

---

**TL;DR:** Read-only Express+Prisma+Postgres-API som följer klassisk layered MVC. Tunna routes, controllers som validerar med zod och kastar `AppError`, en central errorHandler som maskar 500-detaljer. Servern är liten men ovanligt välpolerad i kanten: graceful shutdown med force-exit-timeout, preflight DB-check, färgglad startuplogg som autoupptäcker routes, eget `kingermeat`-CLI med `doctor`. Det som tydligast saknas är tester, rate limiting och paginering.
