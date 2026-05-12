const BASE_URL = import.meta.env.VITE_API_URL

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init)
  if (import.meta.env.DEV) console.log(`[api] ${path} => ${res.status}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}
