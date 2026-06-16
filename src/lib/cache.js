const store = new Map()
const DEFAULT_TTL = 5 * 60 * 1000

export function cacheGet(key) {
  const entry = store.get(key)
  if (!entry) return null
  return entry.data
}

export function cacheSet(key, data, ttl = DEFAULT_TTL) {
  store.set(key, { data, expires: Date.now() + ttl })
}

export function cacheIsStale(key) {
  const entry = store.get(key)
  if (!entry) return true
  return Date.now() > entry.expires
}

export function cacheClear(key) {
  if (key) store.delete(key)
  else store.clear()
}
