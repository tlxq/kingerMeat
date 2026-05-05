import express from "express";
import productRouter from './routes/products.js'
import 'dotenv/config'
// Skapa app-instansen
const app = express()
const PORT = process.env.PORT ?? 3000

// middleware som tolkar JSON i request body
app.use(express.json())

// monterar router på rätt path
app.use('/api/products', productRouter)

// här startas servern
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)

})
