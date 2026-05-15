import 'dotenv/config'
import { config, validateEnvOrExit } from './lib/env.js'

validateEnvOrExit()

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
import debugRouter from './routes/debug.js'
import healthRouter from './routes/health.js'
import pingRouter from './routes/ping.js'
import productRouter from './routes/products.js'
import statsRouter from './routes/stats.js'
import { execSync } from 'node:child_process'
import { log } from './lib/log.js'

// Mät tiden från processtart till att servern lyssnar
const startedAt = performance.now()

const app = express()

// Middleware-kedjan körs i ordning för varje request:
// helmet sätter säkra HTTP-headers, cors släpper in endast godkänd frontend,
// json-parsern begränsas till 100kb för att stoppa stora payloads,
// requestLogger loggar metod, status och svarstid sist i kedjan.
app.use(helmet())
app.use(cors({ origin: config.CORS_ORIGIN }))
app.use(express.json({ limit: '100kb' }))
app.use(requestLogger)

// Routes samlas i en array så de både kan registreras i loopen nedan
// och skickas till logStartup för att skrivas ut snyggt vid uppstart.
const routes: RouteManifest[] = [
  { prefix: '/health', router: healthRouter },
  { prefix: '/api/ping', router: pingRouter },
  { prefix: '/api/products', router: productRouter },
  { prefix: '/api/categories', router: categoryRouter },
  { prefix: '/api/stats', router: statsRouter },
]

// Debug-routes registreras bara utanför prod — de exponerar avsiktliga fel
// och en hängande endpoint som annars skulle vara en gratis DoS-vektor.
if (process.env.NODE_ENV !== 'production') {
  routes.push({ prefix: '/api/debug', router: debugRouter })
}

for (const { prefix, router } of routes) {
  app.use(prefix, router)
}

// 404-fallback måste ligga EFTER alla routes — annars fångar den allt.
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})
// errorHandler sist — fångar fel som kastats i routes/middleware ovan.
app.use(errorHandler)

// Flaggorna används av shutdown() för att avgöra om servern hunnit
// starta och för att garantera att avstängningen bara körs en gång.
let serverReady = false
let shuttingDown = false

// Preflight (db-ping m.m.) körs FÖRE listen() — failar något så startar
// servern aldrig, vilket är bättre än att ta emot requests utan databas.
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
      env: process.env.NODE_ENV ?? config.NODE_ENV,
      corsOrigin: config.CORS_ORIGIN,
      dbLatencyMs: preflight.dbLatencyMs,
      startupMs: Math.round(performance.now() - startedAt),
      ...git,
    },
    routes,
  )
})

// Graceful shutdown: stäng aktiva sockets snyggt, koppla bort databasen,
// och eskalera till force-exit om något hänger sig längre än 10s.
async function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  if (!serverReady) process.exit(0)
  log.info('Shutdown initiated')

  // Säkerhetsnät — om server.close() aldrig kallar callbacken (t.ex. en
  // klient som vägrar släppa sin keep-alive) tvångsavslutar vi efter 10s.
  const forceExit = setTimeout(() => {
    log.fail('Shutdown timed out — force exiting')
    server.closeAllConnections()
    process.exit(1)
  }, 10_000)
  forceExit.unref()

  // Stäng idle keep-alive först så nya requests blockeras direkt,
  // sen close() som väntar in pågående requests innan callbacken kör.
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

// SIGTERM kommer från plattformen (Render, Docker) vid deploy/skalning.
process.on('SIGTERM', () => {
  log.info('[signal] SIGTERM received')
  void shutdown()
})

// SIGINT = Ctrl+C lokalt. I dev vill vi avsluta direkt för snabb iteration;
// i prod kör vi samma graceful shutdown som SIGTERM.
process.on('SIGINT', () => {
  log.info('[signal] SIGINT received')
  if (process.env.NODE_ENV !== 'production') {
    process.exit(0)
  } else {
    void shutdown()
  }
})
