# Kinger Meat

![Kinger Meat](./client/public/img/logo.png)

Online shop for wild game meat from Sörmland, Sweden. Built as a school final project for the YH backend course (F25D) at Yrkeshögskolan i Borås.

**Live:** [kingermeat.ttdevs.com](https://kingermeat.ttdevs.com) · **API:** [api.kingermeat.ttdevs.com](https://api.kingermeat.ttdevs.com)

---

## 🛠 Tech stack

**Backend**

- Node.js ESM + Express 5 + TypeScript
- PostgreSQL via [Neon](https://neon.tech) (serverless)
- Prisma ORM
- Zod (validation)
- dotenv

**Frontend**

- React 19 + TypeScript + Vite
- React Router v7
- Framer Motion

---

## 📁 Project structure

```
kingerMeat/
├── server/       Express API
└── client/       React + Vite frontend
```

---

## 💻 Local development

### Requirements

- Node.js 22+
- A PostgreSQL database (e.g. [Neon](https://neon.tech) free tier)

### Backend

```bash
git clone git@github.com:tlxq/kingerMeat.git
cd kingerMeat/server
npm install
```

Create `server/.env` from the example file:

```bash
cp .env.example .env
```

Get your `DATABASE_URL` from [neon.tech](https://neon.tech) — create a free account, make a new project, and copy the connection string. Then fill in your values in `.env`.

Run migrations and seed:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Start dev server:

```bash
npm run dev
```

### CLI

The project includes a CLI tool for interacting with the API and managing the server.

Install it locally with:

```bash
cd server && npm link
```

```bash
kingermeat serve          # start the server
kingermeat serve --prod   # start with NODE_ENV=production
kingermeat health         # check server and database status
kingermeat products       # list all products
kingermeat doctor         # full health check (env, db, schema, routes)
kingermeat --help         # all available commands
```

### Frontend

```bash
cd kingerMeat/client
npm install
```

Create `client/.env` from the example file:

```bash
cp .env.example .env
```

This points the frontend to your local backend. For production, `.env.production` is used automatically by Vite during build.

Start dev server:

```bash
npm run dev
```

---

## 🔌 API endpoints

### Health & status

| Method | Path         | Description                          |
| ------ | ------------ | ------------------------------------ |
| GET    | `/health`    | Server and database status           |
| GET    | `/api/ping`  | Lightweight liveness check           |
| GET    | `/api/stats` | Total products, categories and stock |

### Products

| Method | Path                          | Description                      |
| ------ | ----------------------------- | -------------------------------- |
| GET    | `/api/products`               | All products with category data  |
| GET    | `/api/products?category=slug` | Filter products by category slug |
| GET    | `/api/products/:id`           | Single product by id             |

### Categories

| Method | Path                  | Description                       |
| ------ | --------------------- | --------------------------------- |
| GET    | `/api/categories`     | All categories with product count |
| GET    | `/api/categories/:id` | Single category with its products |

---

## 🗄️ Database

PostgreSQL hosted on [Neon](https://neon.tech). 

**Category** — `id`, `name`, `slug`, `description`
**Product** — `id`, `name`, `description`, `price`, `weightGrams`, `stockQty`, `categoryId`, `createdAt`



---

## 🚀 Deployment

| Service  | Platform | URL                            |
| -------- | -------- | ------------------------------ |
| Backend  | Render   | api.kingermeat.ttdevs.com      |
| Frontend | Render   | kingermeat.ttdevs.com          |
| Database | Neon     | [neon.tech](https://neon.tech) |

![Kinger Meat GIF](./client/public/img/logo-glitch.gif)
