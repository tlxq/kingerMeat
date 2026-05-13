import { Router } from 'express'
import { getAllProducts, getProductById } from '../controllers/products.js'

// Router för /api/products — läsoperationer (read-only) mot produkt-tabellen.
const router = Router()

// Lista alla produkter — controllern joinar in kategori-info.
router.get('/', getAllProducts)

// Hämta en produkt via id — controllern validerar att id är ett positivt heltal.
router.get('/:id', getProductById)

export default router
