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

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '100kb' }))

app.use(requestLogger)
app.get('/health', async (_req, res) => {
  let db: 'ok' | 'error' = 'ok'
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    db = 'error'
  }
  res.json({
    status: 'ok',
    env: ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db,
  })
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

async function shutdown() {
  await prisma.$disconnect()
  server.close(() => process.exit(0))
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
