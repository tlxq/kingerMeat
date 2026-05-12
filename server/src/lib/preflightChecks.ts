import prisma from '../db/prisma.js'
import { log } from './log.js'

export interface PreflightResult {
  dbLatencyMs: number
}

export async function preflightChecks(): Promise<PreflightResult> {
  const start = performance.now()
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (err) {
    log.fail('Database connection failed', err)
    process.exit(1)
  }
  const dbLatencyMs = Math.round(performance.now() - start)
  return { dbLatencyMs }
}
