import express from 'express'
import productRouter from './routes/products.js'
import categoryRouter from './routes/categories.js'
import statsRouter from './routes/stats.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/requestLogger.js'
import prisma from './db/prisma.js'
import cors from 'cors'
import 'dotenv/config'

// Skapa app-instansen
const app = express()
const PORT = process.env.PORT ?? 3000

// Middleware som tolkar JSON i request body
app.use(express.json())
app.use(cors())
app.use(requestLogger)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Monterar router på rätt path
app.use('/api/products', productRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/stats', statsRouter)
app.use(errorHandler)

// Här startas servern
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

async function shutdown() {
  await prisma.$disconnect()
  server.close(() => process.exit(0))
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
