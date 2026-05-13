import { Router } from 'express'
import { getPing } from '../controllers/ping.js'

// Router för /ping — superlätt liveness-check som frontend pollar mot vid uppstart (loading-bar).
const router = Router()

// Skiljer sig från /health: ingen db-koll, bara "är servern uppe?".
router.get('/', getPing)

export default router
