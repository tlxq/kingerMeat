import express from "express";
import productRouter from './routes/products.js'
import categoryRouter from './routes/categories.js'
import statsRouter from './routes/stats.js'
import { errorHandler } from "./middleware/errorHandler.js";
import 'dotenv/config'
// Skapa app-instansen
const app = express()
const PORT = process.env.PORT ?? 3000

// middleware som tolkar JSON i request body
app.use(express.json())

// monterar router på rätt path
app.use('/api/products', productRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/stats', statsRouter)

app.use(errorHandler)
// här startas servern
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
