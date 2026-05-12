import prisma from '../db/prisma.js'
import { log } from './log.js'

export interface PreflightResult {
  dbLatencyMs: number
}

// Körs av index.ts före app.listen(). Pingar databasen så att vi
// fail:ar snabbt vid uppstart istället för att första requesten gör det.
// Latensen returneras och skrivs ut i startuploggen som hälsoindikator.
export async function preflightChecks(): Promise<PreflightResult> {
  const start = performance.now()
  try {
    // SELECT 1 är en trivial query — testar anslutningen utan att läsa data.
    await prisma.$queryRaw`SELECT 1`
  } catch (err) {
    log.fail('Database connection failed', err)
    // Ingen mening att starta servern utan databas.
    process.exit(1)
  }
  const dbLatencyMs = Math.round(performance.now() - start)
  return { dbLatencyMs }
}
