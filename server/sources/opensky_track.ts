import { cache } from '../cache.js';

export interface FlightTrack {
  icao24: string;
  path: [number, number][]; // [lng, lat]
}

const API_URL = 'https://opensky-network.org/api/tracks/all';

export async function fetchFlightTrack(icao24: string): Promise<FlightTrack | null> {
  const cacheKey = `track_${icao24}`;
  const cached = cache.get<FlightTrack>(cacheKey);
  if (cached) return cached;

  try {
    const headers: Record<string, string> = {};
    const username = process.env.OPENSKY_USERNAME;
    const password = process.env.OPENSKY_PASSWORD;

    if (username && password) {
      headers['Authorization'] = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    }

    const res = await fetch(`${API_URL}?icao24=${icao24}&time=0`, { headers, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.warn(`[OpenSky] Track fetch failed for ${icao24}: ${res.status}`);
      return null;
    }

    const data = await res.json() as {
      icao24: string;
      path: Array<[number, number, number, number, number, boolean]>;
    };

    if (!data.path) return null;

    // OpenSky path format: [time, lat, lng, baro_altitude, true_track, on_ground]
    // DeckGL PathLayer format: [lng, lat]
    const path: [number, number][] = data.path.map((p) => [p[2], p[1]]);

    const track = { icao24, path };
    cache.set(cacheKey, track, 5 * 60 * 1000); // cache for 5 mins
    return track;

  } catch (err) {
    console.error(`[OpenSky] Track fetch error for ${icao24}:`, (err as Error).message);
    return null;
  }
}
