import { Router } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/AppError.js'

const router = Router()

// Hänger 60s så att server.close() inte kan stänga direkt — används för att
// trigga force-exit-timeouten vid graceful shutdown-demos.
router.get('/slow', async (_req, res) => {
  await new Promise((r) => setTimeout(r, 60_000))
  res.json({ ok: true })
})

// Kastar AppError med valfri statuskod — testar errorHandlerns AppError-gren.
router.get('/error/:code', (req, _res) => {
  const code = Number(req.params.code)
  throw new AppError(code, `Triggered ${code}`)
})

// Kastar ett vanligt Error — testar errorHandlerns 500-fallback.
router.get('/throw', () => {
  throw new Error('Boom — unhandled error from /api/debug/throw')
})

// Kastar ZodError — testar errorHandlerns validation-gren.
router.get('/zod', () => {
  z.object({ foo: z.string() }).parse({ foo: 123 })
})

export default router
