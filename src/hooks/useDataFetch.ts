/** Custom hook for data fetching with caching and auto-refresh */

import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheGet, cacheSet } from '../store/cache';

interface UseDataFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  isDemo: boolean;
  refresh: () => void;
}

export function useDataFetch<T>(
  url: string | null,
  intervalMs: number = 60000,
  cacheKey?: string
): UseDataFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!url) return;
    const key = cacheKey || url;

    // Check cache first
    const cached = cacheGet<{ data: T; meta: { isDemo: boolean } }>(key);
    if (cached) {
      setData(cached.data);
      // Removed setLastUpdated from cache so it doesn't instantly show old time before fetch
      setIsDemo(cached.meta.isDemo);
      setLoading(false);
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (mountedRef.current) {
        setData(json.data);
        setLastUpdated(new Date().toISOString());
        setIsDemo(json.meta?.isDemo || false);
        setError(null);
        setLoading(false);

        // Cache the response
        cacheSet(key, json, intervalMs);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError((err as Error).message);
        setLoading(false);
      }
    }
  }, [url, cacheKey, intervalMs]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    const interval = setInterval(fetchData, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchData, intervalMs]);

  return { data, loading, error, lastUpdated, isDemo, refresh: fetchData };
}
