import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import prisma from './db/prisma.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/requestLogger.js'
import categoryRouter from './routes/categories.js'
import productRouter from './routes/products.js'
import statsRouter from './routes/stats.js'

const app = express()
const PORT = process.env.PORT ?? 3000
const ENV = process.env.NODE_ENV ?? 'development'
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

app.use(helmet())
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json({ limit: '100kb' }))

app.use(requestLogger)
app.get('/health', async (_req, res) => {
  const info = {
    env: ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'ok', ...info })
  } catch {
    res.status(503).json({ status: 'degraded', db: 'error', ...info })
  }
})

app.use('/api/products', productRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/stats', statsRouter)
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})
app.use(errorHandler)

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} [${ENV}]`)
})

let shuttingDown = false

async function shutdown() {
  if (shuttingDown) return
  shuttingDown = true

  const forceExit = setTimeout(() => process.exit(1), 10_000)
  forceExit.unref()

  server.close(async (err) => {
    if (err) console.error('Error closing server:', err)
    try {
      await prisma.$disconnect()
      process.exit(0)
    } catch (e) {
      console.error('Error disconnecting prisma:', e)
      process.exit(1)
    }
  })
  server.closeAllConnections()
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
