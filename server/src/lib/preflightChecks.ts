import prisma from '../db/prisma.js'

export interface PreflightResult {
  dbLatencyMs: number
}

export async function preflightChecks(): Promise<PreflightResult> {
  const start = performance.now()
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (err) {
    console.error('Could not connect to database:', err)
    process.exit(1)
  }
  const dbLatencyMs = Math.round(performance.now() - start)
  return { dbLatencyMs }
}
