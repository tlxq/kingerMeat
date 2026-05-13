import 'dotenv/config'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Command, type Help } from 'commander'
import { apiGet, getBaseUrl, printOffline, printResponse } from './format.js'
import { color as c, sym } from '../lib/log.js'
import { envBadge } from '../lib/startupLog.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf8'),
) as { version: string }

// Anpassad help-rendering i samma stil som serve-bannern (src/lib/startupLog.ts).
// Padding görs på ofärgade strängar för att ANSI-koder inte ska räknas in i längden.
function formatHelp(cmd: Command, helper: Help): string {
  const env = process.env.NODE_ENV ?? 'development'
  // isRoot avgör om vi visar Examples och Help-raden — subkommandon får bara Options.
  const isRoot = cmd.parent === null

  const commandRows = helper.visibleCommands(cmd).map((sub) => ({
    name: helper.subcommandTerm(sub),
    desc: sub.description(),
  }))
  // Räknar ut padding från längsta namnet så kolumnerna blir jämna.
  const cmdPad =
    commandRows.length > 0
      ? Math.max(...commandRows.map((r) => r.name.length)) + 2
      : 0

  const optionRows = helper.visibleOptions(cmd).map((opt) => ({
    flags: helper.optionTerm(opt),
    desc: opt.description,
  }))
  const optPad =
    optionRows.length > 0
      ? Math.max(...optionRows.map((r) => r.flags.length)) + 2
      : 0

  const usage = `${helper.commandUsage(cmd)}`

  const lines: string[] = []
  lines.push('')
  lines.push(`  ${c.bold('Kinger Meat CLI')}  ${envBadge(env)}`)
  lines.push(`  ${c.dim(`v${pkg.version}`)}`)
  lines.push('')
  lines.push(`  ${c.dim('Usage')}   ${usage}`)
  if (isRoot) lines.push(`  ${c.dim('Help')}    kingermeat help <command>`)

  if (commandRows.length > 0) {
    lines.push('')
    lines.push(`  ${c.dim(`Commands (${commandRows.length})`)}`)
    for (const { name, desc } of commandRows) {
      lines.push(`     ${c.green(name.padEnd(cmdPad))} ${c.dim(desc)}`)
    }
  }

  if (optionRows.length > 0) {
    lines.push('')
    lines.push(`  ${c.dim('Options')}`)
    for (const { flags, desc } of optionRows) {
      lines.push(`     ${flags.padEnd(optPad)} ${c.dim(desc)}`)
    }
  }

  if (isRoot) {
    lines.push('')
    lines.push(`  ${c.dim('Examples')}`)
    lines.push(`     ${c.dim('$')} kingermeat ping`)
    lines.push(`     ${c.dim('$')} kingermeat products --category nöt`)
    lines.push(`     ${c.dim('$')} kingermeat doctor`)
  }
  lines.push('')

  return lines.join('\n')
}

const program = new Command()

program
  .name('kingermeat')
  .description('Backend utility CLI for debug & API requests')
  .version(pkg.version)
  .configureHelp({ formatHelp })
  .addHelpCommand(false)

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
  .description('Start the API server (same as npm run dev/start)')
  .option('--prod', 'run with NODE_ENV=production — Ctrl+C triggers graceful shutdown')
  .action(async (opts: { prod?: boolean }) => {
    if (opts.prod) process.env.NODE_ENV = 'production'
    await import('../index.js')
  })

program
  .command('seed')
  .description('Run prisma db seed')
  .action(() => {
    execSync('npx prisma db seed', { stdio: 'inherit' })
  })

program
  .command('ping')
  .description('GET /api/ping — uptime & timestamp (liveness check)')
  .action(() => runRequest('/api/ping'))

program
  .command('health')
  .description('GET /health — server status & database check')
  .action(() => runRequest('/health'))

program
  .command('stats')
  .description('GET /api/stats — product, category and stock counts')
  .action(() => runRequest('/api/stats'))

program
  .command('products')
  .argument('[id]', 'product id (omit to list all)')
  .option('-c, --category <slug>', 'filter by category slug')
  .description('GET /api/products or /api/products/:id')
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
  .argument('[id]', 'category id (omit to list all)')
  .description('GET /api/categories or /api/categories/:id')
  .action((id: string | undefined) => {
    const path = id ? `/api/categories/${id}` : '/api/categories'
    return runRequest(path)
  })

program
  .command('debug')
  .argument('<type>', 'slow | throw | zod | error/:code')
  .description('Trigger error handler branches via /api/debug/:type')
  .action((type: string) => runRequest(`/api/debug/${type}`))

program
  .command('get')
  .argument('<path>', 'any path, e.g. /api/products?category=venison')
  .description('Generic GET request to any endpoint')
  .action((path: string) => runRequest(path))

program
  .command('doctor')
  .description('Full health check: env, db, schema and routes')
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
