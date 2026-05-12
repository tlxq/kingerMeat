import { AppError } from '../lib/AppError.js'
import { ZodError } from 'zod'
import type { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: err.issues.map((i) => ({ path: i.path, message: i.message })),
    })
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err)
  res.status(500).json({ error: 'Internal server error' })
}
