import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type StepStatus = 'pending' | 'active' | 'slow' | 'retrying' | 'done' | 'error'

type Meta = {
  pingHttp?: number
  fetchHttp?: number
  retryAttempt?: number
  retryCountdownSec?: number
}

type Props<T> = {
  fetcher: (signal: AbortSignal) => Promise<T>
  children: (data: T) => ReactNode
  pingPath?: string
}

const BASE_URL = import.meta.env.VITE_API_URL
const PING_TIMEOUT_MS = 20_000
const PING_BACKOFFS_SEC = [2, 5, 10]
const FETCH_TIMEOUT_MS = 10_000
const FETCH_BACKOFFS_SEC = [1, 2, 4]
const MAX_ATTEMPTS = 3
const SLOW_PING_AFTER_MS = 1000
const SLOW_FETCH_AFTER_MS = 2000

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function progressPct(a: StepStatus, b: StepStatus): number {
  if (b === 'done') return 100
  if (b === 'active' || b === 'slow' || b === 'retrying') return 75
  if (a === 'done') return 50
  if (a === 'active' || a === 'slow' || a === 'retrying') return 25
  return 0
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'done') {
    return <span className="text-[var(--accent)] text-[1.1rem] leading-none">✓</span>
  }
  if (status === 'error') {
    return <span className="text-[#e25c5c] text-[1.1rem] leading-none">✗</span>
  }
  if (status === 'active' || status === 'slow' || status === 'retrying') {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-3.5 h-3.5 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full"
      />
    )
  }
  return <div className="w-3.5 h-3.5 border-2 border-[var(--border)] rounded-full" />
}

function Step({
  label,
  status,
  httpInfo,
  slowHint,
}: {
  label: string
  status: StepStatus
  httpInfo: string | null
  slowHint: string
}) {
  return (
    <div className="flex gap-3 items-start mb-4">
      <div className="mt-[2px]">
        <StepIcon status={status} />
      </div>
      <div className="flex-1">
        <div
          className={`text-[0.95rem] ${
            status === 'done' ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
          }`}
        >
          {label}
        </div>
        {httpInfo && <div className="text-[0.8rem] text-[var(--text-muted)]">{httpInfo}</div>}
        {status === 'slow' && <div className="text-[0.8rem] text-[var(--accent)]">{slowHint}</div>}
      </div>
    </div>
  )
}

export default function ColdStartLoader<T>({
  fetcher,
  children,
  pingPath = '/api/ping',
}: Props<T>) {
  const [runId, setRunId] = useState(0)
  const [stepA, setStepA] = useState<StepStatus>('pending')
  const [stepB, setStepB] = useState<StepStatus>('pending')
  const [meta, setMeta] = useState<Meta>({})
  const [totalElapsedMs, setTotalElapsedMs] = useState(0)
  const [data, setData] = useState<T | null>(null)
  const [fatalError, setFatalError] = useState<string | null>(null)

  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    let cancelled = false
    const startedAt = performance.now()
    const tickId = setInterval(() => {
      if (!cancelled) setTotalElapsedMs(performance.now() - startedAt)
    }, 250)

    async function runPing(): Promise<boolean> {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        if (cancelled) return false
        setStepA('active')
        const slowTimer = setTimeout(() => {
          if (!cancelled) setStepA((s) => (s === 'active' ? 'slow' : s))
        }, SLOW_PING_AFTER_MS)
        const ctrl = new AbortController()
        const timeoutId = setTimeout(() => ctrl.abort(), PING_TIMEOUT_MS)
        try {
          const res = await fetch(`${BASE_URL}${pingPath}`, { signal: ctrl.signal })
          clearTimeout(slowTimer)
          clearTimeout(timeoutId)
          if (cancelled) return false
          setMeta((m) => ({ ...m, pingHttp: res.status }))
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          await res.json()
          setStepA('done')
          return true
        } catch (err) {
          clearTimeout(slowTimer)
          clearTimeout(timeoutId)
          if (cancelled) return false
          if (attempt === MAX_ATTEMPTS) {
            const msg = err instanceof Error ? err.message : 'unknown error'
            setStepA('error')
            setFatalError(`Backend not responding (${msg}).`)
            return false
          }
          setStepA('retrying')
          setMeta((m) => ({ ...m, retryAttempt: attempt }))
          const backoffSec = PING_BACKOFFS_SEC[attempt - 1]
          for (let s = backoffSec; s > 0; s--) {
            if (cancelled) return false
            setMeta((m) => ({ ...m, retryCountdownSec: s }))
            await sleep(1000)
          }
          setMeta((m) => ({ ...m, retryCountdownSec: undefined, retryAttempt: undefined }))
        }
      }
      return false
    }

    async function runFetch(): Promise<void> {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        if (cancelled) return
        setStepB('active')
        const slowTimer = setTimeout(() => {
          if (!cancelled) setStepB((s) => (s === 'active' ? 'slow' : s))
        }, SLOW_FETCH_AFTER_MS)
        const ctrl = new AbortController()
        const timeoutId = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
        try {
          const result = await fetcherRef.current(ctrl.signal)
          clearTimeout(slowTimer)
          clearTimeout(timeoutId)
          if (cancelled) return
          setStepB('done')
          setData(result)
          return
        } catch (err) {
          clearTimeout(slowTimer)
          clearTimeout(timeoutId)
          if (cancelled) return
          const msg = err instanceof Error ? err.message : String(err)
          const statusMatch = msg.match(/^(\d{3})/)
          if (statusMatch) {
            setMeta((m) => ({ ...m, fetchHttp: Number(statusMatch[1]) }))
          }
          if (attempt === MAX_ATTEMPTS) {
            setStepB('error')
            setFatalError(`Failed to load data (${msg}).`)
            return
          }
          setStepB('retrying')
          setMeta((m) => ({ ...m, retryAttempt: attempt }))
          const backoffSec = FETCH_BACKOFFS_SEC[attempt - 1]
          for (let s = backoffSec; s > 0; s--) {
            if (cancelled) return
            setMeta((m) => ({ ...m, retryCountdownSec: s }))
            await sleep(1000)
          }
          setMeta((m) => ({ ...m, retryCountdownSec: undefined, retryAttempt: undefined }))
        }
      }
    }

    void (async () => {
      const ok = await runPing()
      if (!cancelled && ok) await runFetch()
    })()

    return () => {
      cancelled = true
      clearInterval(tickId)
    }
  }, [runId, pingPath])

  if (data !== null) {
    return <>{children(data)}</>
  }

  const totalSec = Math.floor(totalElapsedMs / 1000)
  const pct = progressPct(stepA, stepB)
  const httpA = meta.pingHttp ? `HTTP ${meta.pingHttp}` : null
  const httpB = meta.fetchHttp ? `HTTP ${meta.fetchHttp}` : null

  const onRetry = () => {
    setStepA('pending')
    setStepB('pending')
    setMeta({})
    setTotalElapsedMs(0)
    setFatalError(null)
    setData(null)
    setRunId((id) => id + 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 min-h-screen flex justify-center items-start"
    >
      <div className="max-w-[480px] w-full mx-auto p-8 bg-[var(--bg-card)] border border-[var(--border)] rounded">
        <h2 className="text-[1.2rem] text-[var(--accent)] tracking-[0.15em] uppercase mb-2">
          Waking up servers
        </h2>
        <p className="text-[0.85rem] text-[var(--text-muted)] mb-8">
          First load can take up to a minute — backend and database are waking up.
        </p>

        <Step
          label="Step 1: Contacting backend"
          status={stepA}
          httpInfo={httpA}
          slowHint="Waking backend..."
        />
        <Step
          label="Step 2: Loading products"
          status={stepB}
          httpInfo={httpB}
          slowHint="Waking database..."
        />

        <div className="h-1 bg-[var(--border)] rounded-sm overflow-hidden mt-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-[var(--accent)]"
          />
        </div>

        <div className="flex justify-between mt-3 text-[0.8rem] text-[var(--text-muted)]">
          <span>Waited {totalSec}s</span>
          {meta.retryCountdownSec !== undefined && meta.retryAttempt !== undefined && (
            <span>
              Retrying in {meta.retryCountdownSec}s... (attempt {meta.retryAttempt + 1} of{' '}
              {MAX_ATTEMPTS})
            </span>
          )}
        </div>

        {fatalError && (
          <div className="mt-6">
            <p className="text-[#e25c5c] text-[0.9rem] mb-4">{fatalError}</p>
            <button
              onClick={onRetry}
              className="px-[1.4rem] py-[0.6rem] bg-[var(--accent)] text-[#0d0f0d] border-0 rounded-sm text-[0.85rem] tracking-[0.05em] font-bold uppercase cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
