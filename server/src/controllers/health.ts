import type { Request, Response } from 'express'
import prisma from '../db/prisma.js'

const ENV = process.env.NODE_ENV ?? 'development'

export async function getHealth(_req: Request, res: Response) {
  const info = {
    env: ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'ok', ...info })
  } catch {
    res.status(503).json({ status: 'degraded', db: 'error', ...info })
  }
}
