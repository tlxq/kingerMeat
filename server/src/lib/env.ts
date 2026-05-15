import { z } from 'zod'

// Validerar miljövariabler vid uppstart med zod — fångar fel direkt
// istället för att appen kraschar senare när en saknad variabel används.
// z.coerce.number() behövs eftersom process.env alltid är strings.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

export type Config = z.infer<typeof envSchema>

const result = envSchema.safeParse(process.env)

export const config: Config = result.data ?? (envSchema.parse({}) as Config)

export function validateEnvOrExit() {
  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    for (const issue of result.error.issues) {
      console.error(`   ${issue.path.join('.')}: ${issue.message}`)
    }
    process.exit(1)
  }
  
  if (!config.DATABASE_URL) {
    console.error('❌ DATABASE_URL is required')
    process.exit(1)
  }
}

export const isEnvValid = result.success && !!config.DATABASE_URL
