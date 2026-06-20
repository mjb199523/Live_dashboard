/** USGS Earthquake data fetcher — REAL DATA, no API key required */

import { cache } from '../cache.js';
import type { NormalizedEvent } from './types.js';

const CACHE_KEY = 'usgs_earthquakes';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';

function magnitudeToSeverity(mag: number): NormalizedEvent['severity'] {
  if (mag >= 7) return 'critical';
  if (mag >= 5.5) return 'high';
  if (mag >= 4) return 'medium';
  return 'low';
}

export async function fetchEarthquakes(): Promise<NormalizedEvent[]> {
  const cached = cache.get<NormalizedEvent[]>(CACHE_KEY);
  if (cached) return cached;

  try {
    const res = await fetch(FEED_URL, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`USGS API returned ${res.status}`);

    const geojson = await res.json() as {
      features: Array<{
        id: string;
        properties: {
          mag: number;
          place: string;
          time: number;
          url: string;
          title: string;
          alert: string | null;
          tsunami: number;
          type: string;
        };
        geometry: {
          coordinates: [number, number, number];
        };
      }>;
    };

    const events: NormalizedEvent[] = geojson.features.map((f) => ({
      id: `usgs-${f.id}`,
      type: 'earthquake',
      title: f.properties.title,
      description: f.properties.place || 'Unknown location',
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      timestamp: new Date(f.properties.time).toISOString(),
      severity: magnitudeToSeverity(f.properties.mag),
      source: 'USGS',
      metadata: {
        magnitude: f.properties.mag,
        depth: f.geometry.coordinates[2],
        url: f.properties.url,
        alert: f.properties.alert,
        tsunami: f.properties.tsunami,
      },
    }));

    cache.set(CACHE_KEY, events, CACHE_TTL);
    return events;
  } catch (err) {
    console.error('[USGS] Fetch error:', err);
    return cache.get<NormalizedEvent[]>(CACHE_KEY) ?? [];
  }
}
