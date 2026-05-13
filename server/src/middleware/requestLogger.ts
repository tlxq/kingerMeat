import type { Request, Response, NextFunction } from 'express'
import { log } from '../lib/log.js'

// Middleware som loggar varje request med metod, URL, status och svarstid.
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  // Vi loggar på 'finish' så att statuskod och total svarstid är kända.
  res.on('finish', () => {
    // Filtrera bort brus från browser-probes (t.ex. Chrome DevTools-anrop).
    if (req.originalUrl.startsWith('/.well-known')) return
    log.request(req.method, req.originalUrl, res.statusCode, Date.now() - start)
  })
  next()
}
