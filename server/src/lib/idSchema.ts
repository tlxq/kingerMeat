import { z } from 'zod'
import { AppError } from './AppError.js'

// URL-params kommer alltid som strings, så vi coerce:ar till number.
// .int().positive() filtrerar bort decimaler, negativa tal och nollor.
export const idSchema = z.coerce.number().int().positive()

// Gemensam helper så att alla routes returnerar samma 400-fel vid ogiltigt id
// istället för att varje controller gör sin egen validering.
export function parseId(raw: unknown): number {
  const parsed = idSchema.safeParse(raw)
  if (!parsed.success) throw new AppError(400, 'Invalid id')
  return parsed.data
}
