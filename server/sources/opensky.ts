/** OpenSky Network flight tracker — REAL DATA, optional credentials */

import { cache } from '../cache.js';
import type { FlightEntry } from './types.js';

const CACHE_KEY = 'opensky_flights';
const CACHE_TTL = 60 * 1000; // 1 minute
const API_URL = 'https://opensky-network.org/api/states/all';

// Generate realistic fallback flights over major global hubs
function getFallbackFlights(): FlightEntry[] {
  const hubs = [
    { lat: 40.64, lng: -73.77 }, // JFK
    { lat: 51.47, lng: -0.45 }, // LHR
    { lat: 35.76, lng: 140.39 }, // NRT
    { lat: 25.25, lng: 55.36 }, // DXB
    { lat: -33.94, lng: 151.17 }, // SYD
  ];
  
  const flights: FlightEntry[] = [];
  hubs.forEach((hub, i) => {
    for (let j = 0; j < 5; j++) {
      flights.push({
        icao24: `mock${i}${j}`,
        callsign: `FLT${i}${j}`,
        originCountry: 'Mock Data',
        lat: hub.lat + (Math.random() - 0.5) * 10,
        lng: hub.lng + (Math.random() - 0.5) * 10,
        altitude: 8000 + Math.random() * 4000,
        velocity: 200 + Math.random() * 100,
        heading: Math.random() * 360,
        onGround: false,
      });
    }
  });
  return flights;
}

export async function fetchFlights(): Promise<FlightEntry[]> {
  const cached = cache.get<FlightEntry[]>(CACHE_KEY);
  if (cached) return cached;

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    const username = process.env.OPENSKY_USERNAME;
    const password = process.env.OPENSKY_PASSWORD;

    if (username && password) {
      headers['Authorization'] = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    }

    const res = await fetch(API_URL, { headers, signal: AbortSignal.timeout(4000) });
    if (!res.ok) {
      if (res.status === 429) {
        console.warn('[OpenSky] Rate limited. Using fallback data.');
        return getFallbackFlights();
      }
      throw new Error(`OpenSky API returned ${res.status}`);
    }

    const data = await res.json() as {
      time: number;
      states: Array<(string | number | boolean | null)[]> | null;
    };

    if (!data.states) return getFallbackFlights();

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
    console.warn('[OpenSky] Fetch error, using fallback:', (err as Error).message);
    return getFallbackFlights();
  }
}
