/** In-memory TTL cache for backend data sources */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private defaultTtlMs = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlMs ?? this.defaultTtlMs,
    });
  }

  isStale(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return true;
    return this.isExpired(entry);
  }

  getAge(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return Infinity;
    return Math.round((Date.now() - entry.timestamp) / 60000);
  }

  getTimestamp(key: string): string | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    return new Date(entry.timestamp).toISOString();
  }

  has(key: string): boolean {
    return this.store.has(key) && !this.isStale(key);
  }

  clear(): void {
    this.store.clear();
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttlMs;
  }
}

export const cache = new MemoryCache();
