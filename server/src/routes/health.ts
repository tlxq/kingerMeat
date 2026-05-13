import { Router } from 'express'
import { getHealth } from '../controllers/health.js'

// Router för /health — används för monitoring och uppstarts-koll.
const router = Router()

// Själva logiken (db-ping, uptime, etc.) ligger i controllern.
router.get('/', getHealth)

export default router
