import type { Request, Response } from 'express'

// Ping används av frontendens progressbar för att se när servern är igång.
export function getPing(_req: Request, res: Response) {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
}
