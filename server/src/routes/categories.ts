import { Router } from 'express'
import { getAllCategories, getCategoryById } from '../controllers/categories.js'

// Router för /api/categories — läsoperationer (read-only) mot kategori-tabellen.
const router = Router()

// Lista alla kategorier.
router.get('/', getAllCategories)

// Hämta en kategori via id — controllern validerar att id är ett positivt heltal.
router.get('/:id', getCategoryById)

export default router
