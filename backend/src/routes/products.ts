import { Router } from 'express'
import { getAllProducts, getProductById } from '../controllers/products.js'

const router = Router()

// GET /api/products --> getAllProducts
router.get('/', getAllProducts)

// GET /api/id --> getProductById
router.get('/:id', getProductById)

export default router
