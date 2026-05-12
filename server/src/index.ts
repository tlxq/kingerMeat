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
import productRouter from './routes/products.js'
import statsRouter from './routes/stats.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: config.CORS_ORIGIN }))
app.use(express.json({ limit: '100kb' }))
app.use(requestLogger)

const routes: RouteManifest[] = [
  { prefix: '/health', router: healthRouter },
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

const server = app.listen(config.PORT, () => {
  serverReady = true
  logStartup(
    {
      port: config.PORT,
      env: config.NODE_ENV,
      corsOrigin: config.CORS_ORIGIN,
      dbLatencyMs: preflight.dbLatencyMs,
    },
    routes,
  )
})

async function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  if (!serverReady) process.exit(0)
  console.log('Shutdown initiated')

  const forceExit = setTimeout(() => {
    console.error('Shutdown timed out — force exiting')
    server.closeAllConnections()
    process.exit(1)
  }, 10_000)
  forceExit.unref()

  server.closeIdleConnections()
  server.close(async (err) => {
    if (err) console.error('Error closing server:', err)
    console.log('HTTP server closed')
    try {
      await prisma.$disconnect()
      console.log('Database disconnected')
      process.exit(0)
    } catch (e) {
      console.error('Error disconnecting prisma:', e)
      process.exit(1)
    }
  })
}

process.on('SIGTERM', () => {
  console.log('[signal] SIGTERM received')
  void shutdown()
})

process.on('SIGINT', () => {
  console.log('[signal] SIGINT received')
  if (config.NODE_ENV === 'development') {
    process.exit(0)
  } else {
    void shutdown()
  }
})
