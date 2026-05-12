// src/middleware/requestLogger.ts
import type { Request, Response, NextFunction } from 'express'
import { log } from '../lib/log.js'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  res.on('finish', () => {
    if (req.originalUrl.startsWith('/.well-known')) return
    log.request(req.method, req.originalUrl, res.statusCode, Date.now() - start)
  })
  next()
}
