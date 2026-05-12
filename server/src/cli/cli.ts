import 'dotenv/config'
import { execSync } from 'node:child_process'
import { Command } from 'commander'
import { apiGet, getBaseUrl, printOffline, printResponse } from './format.js'
import { color as c, sym } from '../lib/log.js'

const program = new Command()

program
  .name('kingermeat')
  .description('Backend utility CLI för debug & API-anrop')
  .version('1.0.0')

// Wrapper som gör fetch-anrop till alla kommandon hanterar offline-server lika
async function runRequest(path: string): Promise<void> {
  try {
    const result = await apiGet(path)
    printResponse('GET', path, result)
    if (!result.ok) process.exit(1)
  } catch (err) {
    process.exit(printOffline(err))
  }
}

program
  .command('serve')
  .description('Starta API-servern (samma som npm run dev/start)')
  .action(async () => {
    await import('../index.js')
  })

program
  .command('seed')
  .description('Kör prisma db seed')
  .action(() => {
    execSync('npx prisma db seed', { stdio: 'inherit' })
  })

program
  .command('ping')
  .description('GET /api/ping — uptime & timestamp')
  .action(() => runRequest('/api/ping'))

program
  .command('health')
  .description('GET /health — status & db-koll')
  .action(() => runRequest('/health'))

program
  .command('stats')
  .description('GET /api/stats — räknare för produkter/kategorier/lager')
  .action(() => runRequest('/api/stats'))

program
  .command('products')
  .argument('[id]', 'produkt-id (utelämna för att lista alla)')
  .option('-c, --category <slug>', 'filtrera på kategori-slug')
  .description('GET /api/products eller /api/products/:id')
  .action((id: string | undefined, opts: { category?: string }) => {
    const base = id ? `/api/products/${id}` : '/api/products'
    const path =
      !id && opts.category
        ? `${base}?category=${encodeURIComponent(opts.category)}`
        : base
    return runRequest(path)
  })

program
  .command('categories')
  .argument('[id]', 'kategori-id (utelämna för att lista alla)')
  .description('GET /api/categories eller /api/categories/:id')
  .action((id: string | undefined) => {
    const path = id ? `/api/categories/${id}` : '/api/categories'
    return runRequest(path)
  })

program
  .command('debug')
  .argument('<type>', 'slow | throw | zod | error/:code')
  .description('Trigga errorHandler-grenar via /api/debug/:type')
  .action((type: string) => runRequest(`/api/debug/${type}`))

program
  .command('get')
  .argument('<path>', 'godtycklig path, t.ex. /api/products?category=nöt')
  .description('Generiskt GET-anrop mot valfri endpoint')
  .action((path: string) => runRequest(path))

program
  .command('doctor')
  .description('Fullt hälsoprotokoll: env, db, schema, routes')
  .action(async () => {
    let allOk = true

    // 1. Env
    try {
      const { config } = await import('../lib/env.js')
      console.log(
        `${sym.ok} Env ${c.dim(`(PORT=${config.PORT}, NODE_ENV=${config.NODE_ENV}, CORS=${config.CORS_ORIGIN})`)}`,
      )
    } catch (err) {
      allOk = false
      console.log(`${sym.fail} Env`)
      if (err instanceof Error) console.log(c.dim(`  ${err.message}`))
    }

    // 2. DB-anslutning
    const { default: prisma } = await import('../db/prisma.js')
    try {
      const start = performance.now()
      await prisma.$queryRaw`SELECT 1`
      const ms = Math.round(performance.now() - start)
      console.log(`${sym.ok} Database ${c.dim(`(${ms}ms)`)}`)
    } catch (err) {
      allOk = false
      console.log(`${sym.fail} Database`)
      if (err instanceof Error) console.log(c.dim(`  ${err.message}`))
    } finally {
      await prisma.$disconnect()
    }

    // 3. Prisma schema
    try {
      execSync('npx prisma validate', { stdio: 'ignore' })
      console.log(`${sym.ok} Prisma schema`)
    } catch {
      allOk = false
      console.log(`${sym.fail} Prisma schema`)
    }

    // 4. API-routes
    const routes = [
      '/health',
      '/api/ping',
      '/api/stats',
      '/api/products',
      '/api/categories',
    ]
    let serverReachable = true
    for (const path of routes) {
      try {
        const r = await apiGet(path)
        const icon = r.ok ? sym.ok : sym.fail
        if (!r.ok) allOk = false
        console.log(
          `${icon} GET ${path} ${c.dim('→')} ${r.status} ${c.dim(`(${r.ms}ms)`)}`,
        )
      } catch {
        allOk = false
        serverReachable = false
        console.log(`${sym.fail} GET ${path} ${c.dim('→')} unreachable`)
      }
    }

    // 5. Port-status
    if (!serverReachable) {
      console.log(
        `${sym.warn} Server not running on ${getBaseUrl()} ${c.dim('— starta med `kingermeat serve` eller `npm run dev`')}`,
      )
    }

    process.exit(allOk ? 0 : 1)
  })

program.parse()
