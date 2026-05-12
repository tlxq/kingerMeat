// lib/startupLog.ts
import pc from 'picocolors'
import type { Router } from 'express'

export interface RouteManifest {
  prefix: string
  router: Router
}

export interface StartupConfig {
  url: string
  env: string
  corsOrigin: string
  dbLatencyMs: number
  startupMs: number
  commit?: string
  branch?: string
}

interface ExpressLayer {
  route?: { path: string; methods: Record<string, boolean> }
}

// Färgkodning per HTTP-verb — gör det lättare att scanna routelistan
const methodColor: Record<string, (s: string) => string> = {
  GET: pc.green,
  // Använder bara GET men för framtida utveckling finns:
  POST: pc.yellow,
  PUT: pc.blue,
  PATCH: pc.magenta,
  DELETE: pc.red,
}

// OSC 8 escape codes gör URL:en klickbar i moderna terminaler (alacritty stödjer detta)
function hyperlink(url: string): string {
  return `\x1b]8;;${url}\x1b\\${url}\x1b]8;;\x1b\\`
}

// Färgad badge för miljö — röd PROD är svår att missa
function envBadge(env: string): string {
  if (env === 'production') return pc.bgRed(pc.white(' PROD '))
  if (env === 'staging') return pc.bgYellow(pc.black(' STAGING '))
  return pc.bgGreen(pc.black(' DEV '))
}

export function logStartup(cfg: StartupConfig, routes: RouteManifest[]): void {
  try {
    const routeLines: string[] = []

    for (const { prefix, router } of routes) {
      const stack = (router as unknown as { stack: ExpressLayer[] }).stack
      for (const layer of stack) {
        if (!layer.route) continue
        const suffix = layer.route.path === '/' ? '' : layer.route.path
        for (const method of Object.keys(layer.route.methods)) {
          const m = method.toUpperCase()
          const color = methodColor[m] ?? pc.white
          routeLines.push(
            `    ${color(m.padEnd(6))} ${pc.dim(prefix)}${suffix}`,
          )
        }
      }
    }

    const gitInfo = cfg.commit
      ? pc.dim(`${cfg.branch ?? 'detached'} @ ${cfg.commit}`)
      : ''

    console.log()
    console.log(pc.bold('  Kinger Meat API') + '  ' + envBadge(cfg.env))
    if (gitInfo) console.log('  ' + gitInfo)
    console.log()
    console.log(`  ${pc.dim('URL')}       ${pc.cyan(hyperlink(cfg.url))}`)
    console.log(`  ${pc.dim('CORS')}      ${cfg.corsOrigin}`)
    console.log(
      `  ${pc.dim('Database')}  ${pc.green('●')} connected ${pc.dim(`(${cfg.dbLatencyMs}ms)`)}`,
    )
    console.log(
      `  ${pc.dim('Node')}      ${process.version} · pid ${process.pid}`,
    )
    console.log()
    console.log(`  ${pc.dim(`Routes (${routeLines.length})`)}`)
    for (const line of routeLines) console.log(line)
    console.log()
    console.log(`  ${pc.green('✓')} ready in ${pc.bold(`${cfg.startupMs}ms`)}`)
    console.log()
  } catch (err) {
    console.error(
      'Failed to render startup log:',
      err instanceof Error ? err.message : err,
    )
  }
}
