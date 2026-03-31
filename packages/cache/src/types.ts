export interface CacheOptions {
  /** Time-to-live in milliseconds (default: 60_000) */
  ttl?: number;
  /** Callback invoked when an entry is evicted */
  onEvict?: (key: object) => void;
}

export interface CacheEntry<T> {
  /** The cached value */
  data: T;
  /** Timestamp (ms since epoch) when this entry becomes stale and should be evicted */
  expires: number;
}

export interface Cache<T> {
  /** Get a cached value, or null if expired/missing */
  get(key: object): T | null;
  /** Set a cached value with optional per-entry TTL override */
  set(key: object, data: T, ttl?: number): void;
  /** Invalidate (delete) a specific cache entry */
  invalidate(key: object): void;
  /** Check if a non-expired entry exists */
  has(key: object): boolean;
  /** Get the raw cache entry (data + expiresAt), or null if expired/missing */
  getEntry(key: object): { data: T; expiresAt: number } | null;
}
