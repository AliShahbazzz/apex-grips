/**
 * In-memory cache for GET /store/catalog. The catalog is small and changes
 * rarely, so one copy per region and sales channel is kept until a catalog
 * event clears it (see src/subscribers/clear-catalog-cache.ts) or it expires.
 *
 * The cache lives in this process, so the subscriber and the route must run in
 * the same one (workerMode "shared", the default). With separate server and
 * worker processes, or several instances, move it to Redis.
 */

/** Safety net for changes no event reports, such as pattern edits */
const TTL_MS = 10 * 60 * 1000

type Entry = { expiresAt: number; value: Promise<unknown> }

const entries = new Map<string, Entry>()

/**
 * Returns the cached value for `key`, building it on a miss. Requests that
 * arrive while it's being built share the same build.
 */
export async function getCachedCatalog<T>(
  key: string,
  build: () => Promise<T>
): Promise<{ value: T; hit: boolean }> {
  const entry = entries.get(key)
  if (entry && entry.expiresAt > Date.now()) {
    return { value: (await entry.value) as T, hit: true }
  }

  const value = build()
  entries.set(key, { expiresAt: Date.now() + TTL_MS, value })
  try {
    return { value: await value, hit: false }
  } catch (error) {
    // Don't keep a failed build; the next request tries again
    if (entries.get(key)?.value === value) entries.delete(key)
    throw error
  }
}

export function clearCatalogCache() {
  entries.clear()
}
