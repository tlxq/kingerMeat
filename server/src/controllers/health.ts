import type { Request, Response } from 'express'
import prisma from '../db/prisma.js'
import { config } from '../lib/env.js'

// Kollar att servern lever OCH att databasen svarar. _req för att vi inte bryr oss om request-objektet.
export async function getHealth(_req: Request, res: Response) {
  // Lite extrainfo som är skönt att se när man pingar /health manuellt.
  const info = {
    env: config.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }
  try {
    // SELECT 1 = billigaste sättet att se om databasen är vid liv.
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'ok', ...info })
  } catch (err) {
    console.error('Health check DB ping failed:', err)
    // 503 = servern är uppe men kan inte göra sitt jobb just nu (db nere).
    res.status(503).json({ status: 'degraded', db: 'error', ...info })
  }
}
