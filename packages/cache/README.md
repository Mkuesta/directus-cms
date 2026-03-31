# @directus-cms/cache

Shared caching utility for all `@directus-cms/*` packages. Replaces the duplicated WeakMap + setTimeout pattern with a clean API: configurable TTL, manual invalidation, stale-while-revalidate, and no dangling timers (safe for serverless).

## Installation

```bash
npm install ../../directus-cms-cache
```

## Usage

### Basic Cache

```ts
import { createCache } from '@directus-cms/cache';

// Create a cache with 60-second TTL (default)
const settingsCache = createCache<SiteSettings>();

// Store a value (keyed by any object — typically the Directus client instance)
settingsCache.set(directusClient, settings);

// Retrieve it
const cached = settingsCache.get(directusClient); // SiteSettings | null

// Check existence
settingsCache.has(directusClient); // true

// Manually invalidate
settingsCache.invalidate(directusClient);
```

### Cache-Aside Pattern (`withCache`)

The most common pattern — fetch from cache if available, otherwise call the fetcher and cache the result:

```ts
import { createCache, withCache } from '@directus-cms/cache';

const settingsCache = createCache<SiteSettings>({ ttl: 60_000 });

export async function getSettings(config: CmsConfig): Promise<SiteSettings> {
  return withCache(settingsCache, config.directus, async () => {
    const raw = await config.directus.request(readSingleton(...));
    return transformSettings(raw);
  });
}
```

The fetcher is only called on cache miss. Subsequent calls within the TTL window return the cached value instantly.

### Stale-While-Revalidate (`withCacheSWR`)

Returns stale data immediately while triggering a background refresh:

```ts
import { createCache, withCacheSWR } from '@directus-cms/cache';

const productsCache = createCache<Product[]>({ ttl: 120_000 });

export async function getProducts(config: ProductConfig): Promise<Product[]> {
  return withCacheSWR(productsCache, config.directus, async () => {
    return fetchAndTransformProducts(config);
  });
}
```

On the first call, waits for the fetcher. On subsequent calls, returns cached data instantly and refreshes in the background. Failed refreshes are silently ignored — stale data continues to be served.

### Custom TTL and Eviction Callback

```ts
const cache = createCache<string>({
  ttl: 30_000, // 30 seconds
  onEvict: (key) => console.log('Evicted cache entry'),
});

// Override TTL for a specific entry
cache.set(myKey, 'value', 10_000); // 10 seconds for this entry only
```

## How It Works

- **WeakMap-backed**: Keys must be objects (typically the Directus SDK client instance). Entries are garbage-collected when the key is no longer referenced.
- **Expiry-on-read**: No `setTimeout` timers. Expired entries are detected and cleaned up when you call `get()` or `has()`. This avoids dangling timers in serverless environments.
- **Zero dependencies**: No external packages required.

## Migrating Existing Code

Before (duplicated across 7+ packages):
```ts
const _cache = new WeakMap<object, { data: Settings; expires: number }>();
const CACHE_TTL = 60_000;

export async function getSettings(config) {
  const cached = _cache.get(config.directus);
  if (cached && cached.expires > Date.now()) return cached.data;
  const data = await fetchSettings(config);
  _cache.set(config.directus, { data, expires: Date.now() + CACHE_TTL });
  return data;
}
```

After:
```ts
import { createCache, withCache } from '@directus-cms/cache';

const settingsCache = createCache<Settings>({ ttl: 60_000 });

export async function getSettings(config) {
  return withCache(settingsCache, config.directus, () => fetchSettings(config));
}
```

## API Reference

### `createCache<T>(options?): Cache<T>`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ttl` | `number` | `60_000` | Time-to-live in milliseconds |
| `onEvict` | `(key: object) => void` | — | Called when an entry is evicted (on read or invalidation) |

### `Cache<T>` Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `get(key)` | `T \| null` | Get cached value, or null if expired/missing |
| `set(key, data, ttl?)` | `void` | Store a value with optional per-entry TTL |
| `invalidate(key)` | `void` | Remove a specific entry |
| `has(key)` | `boolean` | Check if a non-expired entry exists |

### `withCache<T>(cache, key, fetcher): Promise<T>`

Cache-aside helper. Returns cached data on hit, calls fetcher on miss.

### `withCacheSWR<T>(cache, key, fetcher): Promise<T>`

Stale-while-revalidate. Returns cached data immediately and refreshes in background. Waits for fetcher on first call.
