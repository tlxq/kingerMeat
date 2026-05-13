import { Router } from 'express'
import { getStats } from '../controllers/stats.js'

// Hanterar /api/stats — siffrorna vi visar på dashboarden.
const router = Router()

// Bara en endpoint som plockar fram antal produkter, antal kategorier och hur mycket vi har i lager.
router.get('/', getStats)

export default router

