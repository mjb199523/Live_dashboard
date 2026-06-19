/** OpenSky Network flight tracker — REAL DATA, optional credentials */

import { cache } from '../cache.js';
import type { FlightEntry } from './types.js';

const CACHE_KEY = 'opensky_flights';
const CACHE_TTL = 60 * 1000; // 1 minute
const API_URL = 'https://opensky-network.org/api/states/all';

export async function fetchFlights(): Promise<FlightEntry[]> {
  const cached = cache.get<FlightEntry[]>(CACHE_KEY);
  if (cached) return cached;

  try {
    const headers: Record<string, string> = {};
    const username = process.env.OPENSKY_USERNAME;
    const password = process.env.OPENSKY_PASSWORD;

    if (username && password) {
      headers['Authorization'] = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    }

    const res = await fetch(API_URL, { headers, signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      if (res.status === 429) {
        console.warn('[OpenSky] Rate limited');
        return cache.get<FlightEntry[]>(CACHE_KEY) || [];
      }
      throw new Error(`OpenSky API returned ${res.status}`);
    }

    const data = await res.json() as {
      time: number;
      states: Array<(string | number | boolean | null)[]> | null;
    };

    if (!data.states) return [];

    // Limit to 3000 flights for performance, filter for airborne only
    const flights: FlightEntry[] = data.states
      .filter((s) => s[6] !== null && s[5] !== null && s[8] === false)
      .slice(0, 3000)
      .map((s) => ({
        icao24: (s[0] as string) || '',
        callsign: ((s[1] as string) || '').trim(),
        originCountry: (s[2] as string) || '',
        lat: s[6] as number,
        lng: s[5] as number,
        altitude: (s[7] as number) || 0,
        velocity: (s[9] as number) || 0,
        heading: (s[10] as number) || 0,
        onGround: (s[8] as boolean) || false,
      }));

    cache.set(CACHE_KEY, flights, CACHE_TTL);
    return flights;
  } catch (err) {
    console.error('[OpenSky] Fetch error:', (err as Error).message);
    return cache.get<FlightEntry[]>(CACHE_KEY) || [];
  }
}
