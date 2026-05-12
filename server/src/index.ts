import 'dotenv/config'
import { config } from './lib/env.js'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import prisma from './db/prisma.js'
import { preflightChecks } from './lib/preflightChecks.js'
import { logStartup } from './lib/startupLog.js'
import type { RouteManifest } from './lib/startupLog.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/requestLogger.js'
import categoryRouter from './routes/categories.js'
import healthRouter from './routes/health.js'
import pingRouter from './routes/ping.js'
import productRouter from './routes/products.js'
import statsRouter from './routes/stats.js'
import { execSync } from 'node:child_process'
import { log } from './lib/log.js'

// Mät tiden från processtart till att servern lyssnar
const startedAt = performance.now()

const app = express()

app.use(helmet())
app.use(cors({ origin: config.CORS_ORIGIN }))
app.use(express.json({ limit: '100kb' }))
app.use(requestLogger)

const routes: RouteManifest[] = [
  { prefix: '/health', router: healthRouter },
  { prefix: '/api/ping', router: pingRouter },
  { prefix: '/api/products', router: productRouter },
  { prefix: '/api/categories', router: categoryRouter },
  { prefix: '/api/stats', router: statsRouter },
]

for (const { prefix, router } of routes) {
  app.use(prefix, router)
}

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})
app.use(errorHandler)

let serverReady = false
let shuttingDown = false

const preflight = await preflightChecks()

// Hämtar git-info från Render-env i prod, annars lokal git, annars inget
function gitInfo() {
  if (process.env.RENDER_GIT_COMMIT) {
    const commit = process.env.RENDER_GIT_COMMIT.slice(0, 7)
    return process.env.RENDER_GIT_BRANCH
      ? { commit, branch: process.env.RENDER_GIT_BRANCH }
      : { commit }
  }
  try {
    return {
      commit: execSync('git rev-parse --short HEAD').toString().trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
    }
  } catch {
    // Ingen .git tillgänglig (t.ex. i en byggd container) — strunta i git-info
    return {}
  }
}

// PUBLIC_URL sätts i Render-dash; lokalt faller den tillbaka på localhost
const publicUrl = process.env.PUBLIC_URL ?? `http://localhost:${config.PORT}`

const git = gitInfo()

const server = app.listen(config.PORT, () => {
  serverReady = true
  logStartup(
    {
      url: publicUrl,
      env: config.NODE_ENV,
      corsOrigin: config.CORS_ORIGIN,
      dbLatencyMs: preflight.dbLatencyMs,
      startupMs: Math.round(performance.now() - startedAt),
      ...git,
    },
    routes,
  )
})

async function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  if (!serverReady) process.exit(0)
  log.info('Shutdown initiated')

  const forceExit = setTimeout(() => {
    log.fail('Shutdown timed out — force exiting')
    server.closeAllConnections()
    process.exit(1)
  }, 10_000)
  forceExit.unref()

  server.closeIdleConnections()
  server.close(async (err) => {
    if (err) log.fail('Error closing server', err)
    log.ok('HTTP server closed')
    try {
      await prisma.$disconnect()
      log.ok('Database disconnected')
      process.exit(0)
    } catch (e) {
      log.fail('Error disconnecting prisma', e)
      process.exit(1)
    }
  })
}

process.on('SIGTERM', () => {
  log.info('[signal] SIGTERM received')
  void shutdown()
})

process.on('SIGINT', () => {
  log.info('[signal] SIGINT received')
  if (config.NODE_ENV === 'development') {
    process.exit(0)
  } else {
    void shutdown()
  }
})
