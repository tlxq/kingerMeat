import type { Router } from 'express'

export interface RouteManifest {
  prefix: string
  router: Router
}

export interface StartupConfig {
  port: number | string
  env: string
  corsOrigin: string
  dbLatencyMs: number
}

interface ExpressLayer {
  route?: {
    path: string
    methods: Record<string, boolean>
  }
}

const LINE = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

export function logStartup(cfg: StartupConfig, routes: RouteManifest[]): void {
  try {
    const routeLines: string[] = []

    for (const { prefix, router } of routes) {
      const stack = (router as unknown as { stack: ExpressLayer[] }).stack
      for (const layer of stack) {
        if (!layer.route) continue
        const suffix = layer.route.path === '/' ? '' : layer.route.path
        for (const method of Object.keys(layer.route.methods)) {
          routeLines.push(`  ${method.toUpperCase().padEnd(5)} ${prefix}${suffix}`)
        }
      }
    }

    console.log(LINE)
    console.log('  Kinger Meat API')
    console.log(LINE)
    console.log(`  Env          ${cfg.env}`)
    console.log(`  Port         ${cfg.port}`)
    console.log(`  CORS         ${cfg.corsOrigin}`)
    console.log(`  Database     connected (${cfg.dbLatencyMs}ms)`)
    console.log()
    for (const line of routeLines) console.log(line)
    console.log(LINE)
  } catch (err) {
    console.error('Failed to render startup log:', err instanceof Error ? err.message : err)
  }
}
