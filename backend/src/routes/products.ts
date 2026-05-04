import { Router } from 'express'
import { getAllProducts } from '../controllers/products.js'

const router = Router()

// GET /api/products --> getAllProducts
router.get('/', getAllProducts)

export default router
