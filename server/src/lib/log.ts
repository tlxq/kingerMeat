// Enkel loggmodul med färger och symboler — används av startupLog,
// requestLogger och shutdown-flödet för att ge en konsekvent terminal-output.
import pc from 'picocolors'

// Färger aktiveras bara i en riktig terminal. När loggen pipeas till fil
// eller läses i Renders log viewer skickas ren text utan ANSI-koder.
const USE_COLOR = process.stdout.isTTY === true

// Wrappa picocolors så att färger automatiskt försvinner när stdout inte är TTY
// (t.ex. när loggar pipeas till fil eller läses av Render's log viewer)
const c = {
  dim: (s: string) => (USE_COLOR ? pc.dim(s) : s),
  red: (s: string) => (USE_COLOR ? pc.red(s) : s),
  green: (s: string) => (USE_COLOR ? pc.green(s) : s),
  yellow: (s: string) => (USE_COLOR ? pc.yellow(s) : s),
  blue: (s: string) => (USE_COLOR ? pc.blue(s) : s),
  magenta: (s: string) => (USE_COLOR ? pc.magenta(s) : s),
  cyan: (s: string) => (USE_COLOR ? pc.cyan(s) : s),
  white: (s: string) => (USE_COLOR ? pc.white(s) : s),
  black: (s: string) => (USE_COLOR ? pc.black(s) : s),
  bold: (s: string) => (USE_COLOR ? pc.bold(s) : s),
  bgRed: (s: string) => (USE_COLOR ? pc.bgRed(s) : s),
  bgGreen: (s: string) => (USE_COLOR ? pc.bgGreen(s) : s),
  bgYellow: (s: string) => (USE_COLOR ? pc.bgYellow(s) : s),
}

// Symboler för status — matchar startup-loggen
const sym = {
  ok: c.green('✓'),
  fail: c.red('✗'),
  warn: c.yellow('⚠'),
  info: c.cyan('●'),
  arrow: c.dim('→'),
}

export const log = {
  info: (msg: string) => console.log(`${sym.info} ${msg}`),
  ok: (msg: string) => console.log(`${sym.ok} ${msg}`),
  warn: (msg: string) => console.warn(`${sym.warn} ${msg}`),
  // fail tar valfri err — Error skrivs ut med stack-trace, andra typer som de är.
  fail: (msg: string, err?: unknown) => {
    console.error(`${sym.fail} ${msg}`)
    if (err) console.error(err instanceof Error ? err.stack : err)
  },
  // request: en rad per HTTP-anrop. Statuskoden färgkodas så att fel
  // syns direkt i terminalen — 5xx röd, 4xx gul, övrigt grön.
  request: (method: string, url: string, status: number, ms: number) => {
    const statusStr =
      status >= 500
        ? c.red(String(status))
        : status >= 400
          ? c.yellow(String(status))
          : c.green(String(status))
    console.log(
      `${c.dim(method.padEnd(6))} ${url} ${c.dim('→')} ${statusStr} ${c.dim(`${ms}ms`)}`,
    )
  },
}

export { c as color, sym }
