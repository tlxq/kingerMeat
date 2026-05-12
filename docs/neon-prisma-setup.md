# Neon + Prisma 6 — Setup och gotchas

## Varför Prisma 6 och inte nyaste

Projektet använder `prisma@^6` i package.json. `npx prisma` utan version hämtar alltid **senaste globalt** — i vårt fall 7.8.0 — vilket kraschade direkt.

**Breaking change i Prisma 7:**
`url = env("DATABASE_URL")` i `schema.prisma` stöds inte längre.
Prisma 7 kräver en separat `prisma.config.ts` för connection URL.

**Lösning:** använd alltid `npx prisma@6` i detta projekt.

---

## Kommandon i rätt ordning

```bash
# Skapa tabeller i Neon + spara migration-fil
npx prisma@6 migrate dev --name init-postgresql

# Fyll databasen med testdata
npx prisma@6 db seed

# Starta server och verifiera
npm run dev
curl http://localhost:3000/api/products
```

---

## Vad migrate dev gör

1. Ansluter till `DATABASE_URL` i `.env`
2. Skapar tabellerna i databasen
3. Sparar migrationen som SQL-fil i `prisma/migrations/`
4. Regenererar Prisma Client

---

## Gotchas att minnas

- `npx prisma` (utan @6) → hämtar Prisma 7 → kraschar
- Neons connection string måste ha `?sslmode=require` i slutet
- `.env` är gitignorerad — `DATABASE_URL` måste läggas in manuellt i Render dashboard vid deploy
