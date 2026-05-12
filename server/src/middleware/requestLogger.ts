import type { Request, Response, NextFunction } from 'express'

const USE_COLOR = process.stdout.isTTY === true

function statusColor(code: number): string {
  if (!USE_COLOR) return ''
  return code >= 400 ? '\x1b[31m' : '\x1b[32m'
}

const RESET = USE_COLOR ? '\x1b[0m' : ''

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  res.on('finish', () => {
    if (req.originalUrl.startsWith('/.well-known')) return
    const color = statusColor(res.statusCode)
    console.log(
      `${req.method} ${req.originalUrl} => ${color}${res.statusCode}${RESET} (${Date.now() - start}ms)`,
    )
  })
  next()
}
