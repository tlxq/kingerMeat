import type { Request, Response, NextFunction } from 'express'

function statusColor(code: number): string {
  if (code >= 400) return '\x1b[31m'
  return '\x1b[32m'
}

const RESET = '\x1b[0m'

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
