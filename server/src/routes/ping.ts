import { Router } from 'express'
import { getPing } from '../controllers/ping.js'

const router = Router()

router.get('/', getPing)

export default router
