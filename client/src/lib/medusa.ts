const BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY

export const REGION_COUNTRY = import.meta.env.VITE_MEDUSA_REGION_COUNTRY ?? "in"

type QueryValue = string | number | undefined

type RequestOptions = {
  method?: "GET" | "POST" | "DELETE"
  query?: Record<string, QueryValue>
  body?: unknown
  /** JWT sent as a bearer token */
  token?: string
  signal?: AbortSignal
}

/** Error from a Medusa route, carrying the HTTP status */
export class MedusaError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "MedusaError"
    this.status = status
  }
}

/** Call a Medusa route, e.g. medusaRequest("/store/customers/me", { token }) */
export async function medusaRequest<T>(
  path: string,
  { method = "GET", query = {}, body, token, signal }: RequestOptions = {}
): Promise<T> {
  if (!BACKEND_URL || !PUBLISHABLE_KEY) {
    throw new Error("VITE_MEDUSA_BACKEND_URL and VITE_MEDUSA_PUBLISHABLE_KEY must be set")
  }

  const url = new URL(path, BACKEND_URL)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }

  const headers: Record<string, string> = { "x-publishable-api-key": PUBLISHABLE_KEY }
  if (body !== undefined) headers["content-type"] = "application/json"
  if (token) headers.authorization = `Bearer ${token}`

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  // Some routes reply with a bare status, e.g. 201 "Created"
  const isJson = response.headers.get("content-type")?.includes("application/json")
  const data = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    throw new MedusaError(
      data?.message ?? `Request failed: ${response.status} ${path}`,
      response.status
    )
  }

  return data as T
}

/** GET a Medusa store API route, e.g. storeGet("/store/products", { limit: 10 }) */
export function storeGet<T>(
  path: string,
  query: Record<string, QueryValue> = {},
  signal?: AbortSignal
): Promise<T> {
  return medusaRequest<T>(path, { query, signal })
}
