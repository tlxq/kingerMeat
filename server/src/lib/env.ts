import { z } from 'zod'

// Validerar miljövariabler vid uppstart med zod — fångar fel direkt
// istället för att appen kraschar senare när en saknad variabel används.
// z.coerce.number() behövs eftersom process.env alltid är strings.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

// Typen härleds direkt från schemat så vi slipper hålla två i synk.
export type Config = z.infer<typeof envSchema>

// safeParse istället för parse — vi vill kunna logga ALLA fel på en gång
// innan vi avbryter, inte bara det första.
const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error('Invalid environment variables:')
  for (const issue of result.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`)
  }
  // Fail fast — hellre stoppa starten än att köra med trasig config.
  process.exit(1)
}

export const config: Config = result.data
