import { useEffect, useState } from 'react'
import { apiFetch } from './lib/api'

function App() {
  const [connected, setConnected] = useState<boolean | null>(null)

  useEffect(() => {
    apiFetch<{ status: string }>('/health')
      .then(() => setConnected(true))
      .catch(() => setConnected(false))
  }, [])

  const status = connected === null ? 'Ansluter...' : connected ? 'API ansluten' : 'API offline'

  return <div>{status}</div>
}

export default App
