const BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY

export const REGION_COUNTRY = import.meta.env.VITE_MEDUSA_REGION_COUNTRY ?? "in"

type QueryValue = string | number | undefined

/** GET a Medusa store API route, e.g. storeGet("/store/products", { limit: 10 }) */
export async function storeGet<T>(
  path: string,
  query: Record<string, QueryValue> = {},
  signal?: AbortSignal
): Promise<T> {
  if (!BACKEND_URL || !PUBLISHABLE_KEY) {
    throw new Error("VITE_MEDUSA_BACKEND_URL and VITE_MEDUSA_PUBLISHABLE_KEY must be set")
  }

  const url = new URL(path, BACKEND_URL)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }

  const response = await fetch(url, {
    headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
    signal,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed: ${response.status} ${path}`)
  }

  return response.json() as Promise<T>
}
