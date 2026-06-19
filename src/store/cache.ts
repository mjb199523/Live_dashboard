/** Client-side cache with localStorage persistence and TTL */

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

function getCacheKey(key: string): string {
  return `dashboard_cache_${key}`;
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(getCacheKey(key));
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > entry.ttlMs) {
      localStorage.removeItem(getCacheKey(key));
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttlMs };
    localStorage.setItem(getCacheKey(key), JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function cacheTimestamp(key: string): string | null {
  try {
    const raw = localStorage.getItem(getCacheKey(key));
    if (!raw) return null;
    const entry = JSON.parse(raw);
    return new Date(entry.timestamp).toISOString();
  } catch {
    return null;
  }
}
