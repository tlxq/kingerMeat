import { Router } from 'express'
import { getAllProducts, getProductById } from '../controllers/products.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

// GET /api/products --> getAllProducts
router.get('/', asyncHandler(getAllProducts))

// GET /api/id --> getProductById
router.get('/:id', asyncHandler(getProductById))

export default router
