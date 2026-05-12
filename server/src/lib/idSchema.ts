import { z } from 'zod'
import { AppError } from './AppError.js'

export const idSchema = z.coerce.number().int().positive()

export function parseId(raw: unknown): number {
  const parsed = idSchema.safeParse(raw)
  if (!parsed.success) throw new AppError(400, 'Invalid id')
  return parsed.data
}
