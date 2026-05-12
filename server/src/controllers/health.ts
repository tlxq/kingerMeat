import type { Request, Response } from 'express'
import prisma from '../db/prisma.js'
import { config } from '../lib/env.js'

export async function getHealth(_req: Request, res: Response) {
  const info = {
    env: config.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'ok', ...info })
  } catch (err) {
    console.error('Health check DB ping failed:', err)
    res.status(503).json({ status: 'degraded', db: 'error', ...info })
  }
}
