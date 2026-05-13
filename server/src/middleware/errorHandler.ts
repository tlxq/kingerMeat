import { AppError } from '../lib/AppError.js'
import { ZodError } from 'zod'
import type { Request, Response, NextFunction } from 'express'
import { log } from '../lib/log.js'

// Central felhanterare. Express känner igen den som error-middleware
// just för att den har FYRA parametrar — _next är obligatorisk i signaturen
// även om vi inte använder den, annars triggas inte error-mode.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Förväntade fel från våra controllers — använd den medskickade statuskoden.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  // Valideringsfel från zod — skicka tillbaka detaljer så klienten vet
  // exakt vilket fält som var fel.
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: err.issues.map((i) => ({ path: i.path, message: i.message })),
    })
  }

  // Allt annat = oväntad bugg. Logga internt men läck INTE detaljer
  // till klienten (säkerhetsrisk — stack-traces kan avslöja interna paths).
  log.fail(`Unhandled error on ${req.method} ${req.originalUrl}`, err)
  return res.status(500).json({ error: 'Internal server error' })
}
