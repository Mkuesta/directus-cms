import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCache, withCache, withCacheSWR } from '../../directus-cms-cache/src/cache.js';

// ---------------------------------------------------------------------------
// createCache
// ---------------------------------------------------------------------------
describe('createCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('get() returns null for missing key', () => {
    const cache = createCache<string>();
    const key = {};
    expect(cache.get(key)).toBeNull();
  });

  it('set() then get() returns cached value', () => {
    const cache = createCache<string>();
    const key = {};
    cache.set(key, 'hello');
    expect(cache.get(key)).toBe('hello');
  });

  it('has() returns false for missing key', () => {
    const cache = createCache<string>();
    const key = {};
    expect(cache.has(key)).toBe(false);
  });

  it('has() returns true for cached key', () => {
    const cache = createCache<string>();
    const key = {};
    cache.set(key, 'hello');
    expect(cache.has(key)).toBe(true);
  });

  it('invalidate() removes cached entry', () => {
    const cache = createCache<string>();
    const key = {};
    cache.set(key, 'hello');
    expect(cache.get(key)).toBe('hello');
    cache.invalidate(key);
    expect(cache.get(key)).toBeNull();
  });

  it('expired entries return null on get()', () => {
    const cache = createCache<string>({ ttl: 5000 });
    const key = {};
    cache.set(key, 'hello');
    expect(cache.get(key)).toBe('hello');

    // Advance past TTL
    vi.advanceTimersByTime(5001);
    expect(cache.get(key)).toBeNull();
  });

  it('expired entries return false on has()', () => {
    const cache = createCache<string>({ ttl: 5000 });
    const key = {};
    cache.set(key, 'hello');
    expect(cache.has(key)).toBe(true);

    vi.advanceTimersByTime(5001);
    expect(cache.has(key)).toBe(false);
  });

  it('onEvict callback fires when entry expires on get()', () => {
    const onEvict = vi.fn();
    const cache = createCache<string>({ ttl: 5000, onEvict });
    const key = {};
    cache.set(key, 'hello');

    vi.advanceTimersByTime(5001);
    cache.get(key);

    expect(onEvict).toHaveBeenCalledTimes(1);
    expect(onEvict).toHaveBeenCalledWith(key);
  });

  it('onEvict callback fires when entry expires on has()', () => {
    const onEvict = vi.fn();
    const cache = createCache<string>({ ttl: 5000, onEvict });
    const key = {};
    cache.set(key, 'hello');

    vi.advanceTimersByTime(5001);
    cache.has(key);

    expect(onEvict).toHaveBeenCalledTimes(1);
    expect(onEvict).toHaveBeenCalledWith(key);
  });

  it('onEvict callback fires when invalidate() is called', () => {
    const onEvict = vi.fn();
    const cache = createCache<string>({ ttl: 60_000, onEvict });
    const key = {};
    cache.set(key, 'hello');
    cache.invalidate(key);

    expect(onEvict).toHaveBeenCalledTimes(1);
    expect(onEvict).toHaveBeenCalledWith(key);
  });

  it('onEvict does not fire when invalidating a key that was never set', () => {
    const onEvict = vi.fn();
    const cache = createCache<string>({ onEvict });
    const key = {};
    cache.invalidate(key);

    expect(onEvict).not.toHaveBeenCalled();
  });

  it('custom TTL per-entry overrides default TTL', () => {
    const cache = createCache<string>({ ttl: 60_000 });
    const key = {};
    // Set with a custom TTL of 2 seconds
    cache.set(key, 'short-lived', 2000);

    expect(cache.get(key)).toBe('short-lived');

    // After 2s (custom TTL), it should be expired
    vi.advanceTimersByTime(2001);
    expect(cache.get(key)).toBeNull();
  });

  it('default TTL is 60_000ms when not specified', () => {
    const cache = createCache<string>();
    const key = {};
    cache.set(key, 'hello');

    // Still valid at 59s
    vi.advanceTimersByTime(59_000);
    expect(cache.get(key)).toBe('hello');

    // Expired after 60s
    vi.advanceTimersByTime(1_001);
    expect(cache.get(key)).toBeNull();
  });

  it('different object keys store independent values', () => {
    const cache = createCache<string>();
    const key1 = {};
    const key2 = {};

    cache.set(key1, 'value-a');
    cache.set(key2, 'value-b');

    expect(cache.get(key1)).toBe('value-a');
    expect(cache.get(key2)).toBe('value-b');

    // Invalidating one should not affect the other
    cache.invalidate(key1);
    expect(cache.get(key1)).toBeNull();
    expect(cache.get(key2)).toBe('value-b');
  });

  it('WeakMap behavior: uses object identity for keys', () => {
    const cache = createCache<string>();
    const key = { id: 1 };
    const differentKeyWithSameShape = { id: 1 };

    cache.set(key, 'hello');

    // Same reference retrieves the value
    expect(cache.get(key)).toBe('hello');
    // Different object (even with same shape) does not match
    expect(cache.get(differentKeyWithSameShape)).toBeNull();
  });

  it('overwriting an entry replaces data and resets TTL', () => {
    const cache = createCache<string>({ ttl: 5000 });
    const key = {};

    cache.set(key, 'first');
    vi.advanceTimersByTime(4000);

    // Overwrite with new value (resets TTL)
    cache.set(key, 'second');

    // Still valid at 4s after overwrite
    vi.advanceTimersByTime(4000);
    expect(cache.get(key)).toBe('second');

    // Expired after 5s from overwrite
    vi.advanceTimersByTime(1_001);
    expect(cache.get(key)).toBeNull();
  });

  it('stores complex objects as values', () => {
    const cache = createCache<{ name: string; items: number[] }>();
    const key = {};
    const value = { name: 'test', items: [1, 2, 3] };

    cache.set(key, value);
    const retrieved = cache.get(key);

    expect(retrieved).toEqual(value);
    // Should be the same reference (no cloning)
    expect(retrieved).toBe(value);
  });
});

// ---------------------------------------------------------------------------
// withCache
// ---------------------------------------------------------------------------
describe('withCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns fetched data on cache miss', async () => {
    const cache = createCache<string>();
    const key = {};
    const fetcher = vi.fn().mockResolvedValue('fetched-data');

    const result = await withCache(cache, key, fetcher);

    expect(result).toBe('fetched-data');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('returns cached data on cache hit (fetcher not called)', async () => {
    const cache = createCache<string>();
    const key = {};
    cache.set(key, 'cached-data');

    const fetcher = vi.fn().mockResolvedValue('fresh-data');
    const result = await withCache(cache, key, fetcher);

    expect(result).toBe('cached-data');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('caches the fetcher result for subsequent calls', async () => {
    const cache = createCache<string>();
    const key = {};
    const fetcher = vi.fn().mockResolvedValue('fetched-data');

    // First call — cache miss
    await withCache(cache, key, fetcher);
    // Second call — cache hit
    const result = await withCache(cache, key, fetcher);

    expect(result).toBe('fetched-data');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('calls fetcher again after cache entry expires', async () => {
    const cache = createCache<string>({ ttl: 5000 });
    const key = {};
    const fetcher = vi.fn()
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second');

    const result1 = await withCache(cache, key, fetcher);
    expect(result1).toBe('first');

    vi.advanceTimersByTime(5001);

    const result2 = await withCache(cache, key, fetcher);
    expect(result2).toBe('second');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// withCacheSWR
// ---------------------------------------------------------------------------
describe('withCacheSWR', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns fetched data when cache is empty', async () => {
    const cache = createCache<string>();
    const key = {};
    const fetcher = vi.fn().mockResolvedValue('fresh-data');

    const result = await withCacheSWR(cache, key, fetcher);

    expect(result).toBe('fresh-data');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('returns cached data immediately (stale-while-revalidate)', async () => {
    const cache = createCache<string>();
    const key = {};
    cache.set(key, 'stale-data');

    const fetcher = vi.fn().mockResolvedValue('fresh-data');
    const result = await withCacheSWR(cache, key, fetcher);

    // Returns stale data immediately
    expect(result).toBe('stale-data');
  });

  it('triggers background refresh when returning cached data', async () => {
    const cache = createCache<string>();
    const key = {};
    cache.set(key, 'stale-data');

    const fetcher = vi.fn().mockResolvedValue('refreshed-data');
    await withCacheSWR(cache, key, fetcher);

    // Fetcher is called for background refresh
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Allow the microtask (promise resolution) to complete
    await vi.runAllTimersAsync();

    // Cache should now have the refreshed data
    expect(cache.get(key)).toBe('refreshed-data');
  });

  it('caches the fetcher result when cache was empty', async () => {
    const cache = createCache<string>();
    const key = {};
    const fetcher = vi.fn().mockResolvedValue('fresh-data');

    await withCacheSWR(cache, key, fetcher);

    // Data should now be cached
    expect(cache.get(key)).toBe('fresh-data');
  });

  it('silently handles background refresh failures', async () => {
    const cache = createCache<string>();
    const key = {};
    cache.set(key, 'stale-data');

    const fetcher = vi.fn().mockRejectedValue(new Error('network error'));
    const result = await withCacheSWR(cache, key, fetcher);

    // Returns stale data
    expect(result).toBe('stale-data');

    // Allow the microtask to settle (the rejected promise should be caught)
    await vi.runAllTimersAsync();

    // Cache should still have old data (not cleared on error)
    expect(cache.get(key)).toBe('stale-data');
  });
});
