import type { CacheOptions, CacheEntry, Cache } from './types.js';

/**
 * Create a typed cache instance backed by WeakMap.
 * Uses expiry-check-on-read (no setTimeout timers) — safe for serverless.
 * Keys must be objects (typically the Directus client instance).
 */
export function createCache<T>(options?: CacheOptions): Cache<T> {
  const defaultTtl = options?.ttl ?? 60_000;
  const onEvict = options?.onEvict;
  const store = new WeakMap<object, CacheEntry<T>>();

  return {
    get(key: object): T | null {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expires) {
        store.delete(key);
        onEvict?.(key);
        return null;
      }
      return entry.data;
    },

    set(key: object, data: T, ttl?: number): void {
      store.set(key, {
        data,
        expires: Date.now() + (ttl ?? defaultTtl),
      });
    },

    invalidate(key: object): void {
      const had = store.has(key);
      store.delete(key);
      if (had) onEvict?.(key);
    },

    has(key: object): boolean {
      const entry = store.get(key);
      if (!entry) return false;
      if (Date.now() > entry.expires) {
        store.delete(key);
        onEvict?.(key);
        return false;
      }
      return true;
    },

    getEntry(key: object): { data: T; expiresAt: number } | null {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expires) {
        store.delete(key);
        onEvict?.(key);
        return null;
      }
      return { data: entry.data, expiresAt: entry.expires };
    },
  };
}

/**
 * Cache-aside helper: returns cached data if available, otherwise calls
 * fetcher, caches the result, and returns it.
 */
export async function withCache<T>(
  cache: Cache<T>,
  key: object,
  fetcher: () => Promise<T>,
): Promise<T> {
  if (cache.has(key)) return cache.get(key) as T;

  const data = await fetcher();
  cache.set(key, data);
  return data;
}

/**
 * Stale-while-revalidate: returns stale data immediately while triggering
 * a background refresh when the entry is near expiry. If no cached data
 * exists, waits for fetcher.
 *
 * @param staleThreshold - ms before expiry at which to trigger background refresh.
 *   When omitted, background refresh fires on every hit (classic SWR).
 *   When set, refresh only fires when remaining TTL <= staleThreshold.
 */
export async function withCacheSWR<T>(
  cache: Cache<T>,
  key: object,
  fetcher: () => Promise<T>,
  staleThreshold?: number,
): Promise<T> {
  const entry = cache.getEntry(key);

  if (entry !== null) {
    const remaining = entry.expiresAt - Date.now();
    const needsRefresh = staleThreshold == null || remaining <= staleThreshold;

    if (needsRefresh) {
      // Trigger background revalidation — fire-and-forget
      fetcher().then((data) => {
        cache.set(key, data);
      }).catch(() => {
        // Silently fail — stale data is still served
      });
    }
    return entry.data;
  }

  // No cached data — must wait for fresh data
  const data = await fetcher();
  cache.set(key, data);
  return data;
}
