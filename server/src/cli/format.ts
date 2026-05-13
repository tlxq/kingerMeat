import { config } from '../lib/env.js'
import { color as c, sym } from '../lib/log.js'

export interface ApiResult {
  status: number
  statusText: string
  ms: number
  body: unknown
  ok: boolean
}

// KM_API_URL låter oss peka CLI:t mot en annan server, t.ex. den på Render.
export function getBaseUrl(): string {
  return process.env.KM_API_URL ?? `http://localhost:${config.PORT}`
}

// Pretty JSON, dimmad så fokus ligger på statusraden ovanför
function formatBody(body: unknown): string {
  const json = JSON.stringify(body, null, 2)
  return json
    .split('\n')
    .map((line) => '  ' + c.dim(line))
    .join('\n')
}

function colorStatus(status: number): string {
  if (status >= 500) return c.red(String(status))
  if (status >= 400) return c.yellow(String(status))
  return c.green(String(status))
}

// Gör ett GET-anrop och mäter svarstiden. Faller tillbaka på text om svaret inte är JSON.
export async function apiGet(path: string): Promise<ApiResult> {
  const url = getBaseUrl() + (path.startsWith('/') ? path : `/${path}`)
  const start = performance.now()
  const res = await fetch(url)
  const ms = Math.round(performance.now() - start)
  let body: unknown
  try {
    body = await res.json()
  } catch {
    body = await res.text().catch(() => null)
  }
  return {
    status: res.status,
    statusText: res.statusText,
    ms,
    body,
    ok: res.ok,
  }
}

export function printResponse(
  method: string,
  path: string,
  result: ApiResult,
): void {
  const line = `${c.dim(method.padEnd(6))} ${path} ${c.dim('→')} ${colorStatus(result.status)} ${c.dim(result.statusText)} ${c.dim(`(${result.ms}ms)`)}`
  console.log(line)
  if (result.body !== null && result.body !== undefined) {
    console.log(formatBody(result.body))
  }
}

// Skriver ut offline-meddelande och returnerar exitkod 1
export function printOffline(err: unknown): number {
  console.log(`${sym.fail} Server offline at ${getBaseUrl()}`)
  if (err instanceof Error && err.message) {
    console.log(c.dim(`  ${err.message}`))
  }
  return 1
}
