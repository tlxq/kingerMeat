# Kinger Meat

REST API for an online wild game meat shop. Built as a school final project (YH backend course) F25D Yrkeshögskolan i Borås.

## Requirements

- Node.js 20+
- MySQL or MariaDB

## Installation

1. Clone the repository

```
git clone https://github.com/your-username/kingerMeat.git
cd kingerMeat/server
```

2. Install dependencies

```
npm install
```

3. Create a `.env` file in `server/`

```
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/kinger_meat"
PORT=3000
```

4. Run database migrations

```
npx prisma migrate dev
```

5. Seed the database with sample data

```
npx prisma db seed
```

## Start

```
npm run dev
```

## Endpoints

### Health

| Method | Path    | Description   |
| ------ | ------- | ------------- |
| GET    | /health | Server status |

### Products

| Method | Path                        | Description                      |
| ------ | --------------------------- | -------------------------------- |
| GET    | /api/products               | Get all products                 |
| GET    | /api/products?category=slug | Filter products by category slug |
| GET    | /api/products/:id           | Get a single product by id       |

### Categories

| Method | Path                | Description                           |
| ------ | ------------------- | ------------------------------------- |
| GET    | /api/categories     | Get all categories with product count |
| GET    | /api/categories/:id | Get a category with its products      |

### Stats

| Method | Path       | Description                                    |
| ------ | ---------- | ---------------------------------------------- |
| GET    | /api/stats | Total products, categories, and stock quantity |

## Tech stack

- Node.js with ESM
- Express 5
- TypeScript
- Prisma ORM
- MySQL / MariaDB
- Zod (validation)
- dotenv
