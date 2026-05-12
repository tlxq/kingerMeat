import { Router } from 'express'
import { getAllCategories, getCategoryById } from '../controllers/categories.js'

const router = Router()

// GET /api/categories --> getAllCategories
router.get('/', getAllCategories)

// GET /api/categories/:id --> getCategoryById
router.get('/:id', getCategoryById)

export default router
