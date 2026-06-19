/** NASA FIRMS wildfire fetcher — REAL DATA with free MAP_KEY, demo fallback */

import { cache } from '../cache.js';
import type { NormalizedEvent } from './types.js';

const CACHE_KEY = 'firms_wildfires';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function buildFirmsUrl(mapKey: string): string {
  // VIIRS SNPP data, world, last 24h
  return `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/world/1`;
}

function parseCsvToEvents(csv: string): NormalizedEvent[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  const latIdx = headers.indexOf('latitude');
  const lngIdx = headers.indexOf('longitude');
  const brightnessIdx = headers.indexOf('bright_ti4');
  const dateIdx = headers.indexOf('acq_date');
  const timeIdx = headers.indexOf('acq_time');
  const confidenceIdx = headers.indexOf('confidence');
  const frpIdx = headers.indexOf('frp');

  // Sample to max 300 points for performance
  const step = Math.max(1, Math.floor((lines.length - 1) / 300));
  const events: NormalizedEvent[] = [];

  for (let i = 1; i < lines.length; i += step) {
    const cols = lines[i].split(',');
    const lat = parseFloat(cols[latIdx]);
    const lng = parseFloat(cols[lngIdx]);
    const brightness = parseFloat(cols[brightnessIdx]) || 300;
    const frp = parseFloat(cols[frpIdx]) || 0;
    const confidence = cols[confidenceIdx] || 'nominal';

    if (isNaN(lat) || isNaN(lng)) continue;

    const severity: NormalizedEvent['severity'] =
      frp > 100 || confidence === 'high' ? 'critical' :
      frp > 50 ? 'high' :
      frp > 10 ? 'medium' : 'low';

    events.push({
      id: `firms-${i}-${lat.toFixed(2)}-${lng.toFixed(2)}`,
      type: 'wildfire',
      title: `Wildfire hotspot (${brightness.toFixed(0)}K)`,
      description: `FRP: ${frp.toFixed(1)} MW, Confidence: ${confidence}`,
      lat,
      lng,
      timestamp: `${cols[dateIdx]}T${(cols[timeIdx] || '0000').replace(/(\d{2})(\d{2})/, '$1:$2')}:00Z`,
      severity,
      source: 'NASA FIRMS',
      metadata: { brightness, frp, confidence },
    });
  }

  return events;
}

export async function fetchWildfires(): Promise<NormalizedEvent[]> {
  const cached = cache.get<NormalizedEvent[]>(CACHE_KEY);
  if (cached) return cached;

  const mapKey = process.env.FIRMS_MAP_KEY;
  if (!mapKey) {
    console.warn('[FIRMS] No MAP_KEY set, using demo wildfire data');
    return getDemoWildfires();
  }

  try {
    const res = await fetch(buildFirmsUrl(mapKey), { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`FIRMS API returned ${res.status}`);
    const csv = await res.text();
    const events = parseCsvToEvents(csv);
    cache.set(CACHE_KEY, events, CACHE_TTL);
    return events;
  } catch (err) {
    console.error('[FIRMS] Fetch error:', (err as Error).message);
    return cache.get<NormalizedEvent[]>(CACHE_KEY) ?? getDemoWildfires();
  }
}

function getDemoWildfires(): NormalizedEvent[] {
  return [
    { id: 'wf-demo-1', type: 'wildfire', title: 'Wildfire — Northern California', description: 'DEMO DATA — FRP: 89.2 MW', lat: 39.8, lng: -121.5, timestamp: new Date().toISOString(), severity: 'high', source: 'NASA FIRMS (Demo)', metadata: { isDemo: true, frp: 89.2 } },
    { id: 'wf-demo-2', type: 'wildfire', title: 'Wildfire — Central Portugal', description: 'DEMO DATA — FRP: 45.1 MW', lat: 39.7, lng: -8.1, timestamp: new Date().toISOString(), severity: 'medium', source: 'NASA FIRMS (Demo)', metadata: { isDemo: true, frp: 45.1 } },
    { id: 'wf-demo-3', type: 'wildfire', title: 'Wildfire — Siberia', description: 'DEMO DATA — FRP: 120.5 MW', lat: 62.0, lng: 100.0, timestamp: new Date().toISOString(), severity: 'critical', source: 'NASA FIRMS (Demo)', metadata: { isDemo: true, frp: 120.5 } },
    { id: 'wf-demo-4', type: 'wildfire', title: 'Wildfire — Amazon Basin', description: 'DEMO DATA — FRP: 67.3 MW', lat: -3.5, lng: -60.0, timestamp: new Date().toISOString(), severity: 'high', source: 'NASA FIRMS (Demo)', metadata: { isDemo: true, frp: 67.3 } },
    { id: 'wf-demo-5', type: 'wildfire', title: 'Wildfire — Eastern Australia', description: 'DEMO DATA — FRP: 32.8 MW', lat: -33.8, lng: 150.5, timestamp: new Date().toISOString(), severity: 'medium', source: 'NASA FIRMS (Demo)', metadata: { isDemo: true, frp: 32.8 } },
    { id: 'wf-demo-6', type: 'wildfire', title: 'Wildfire — British Columbia', description: 'DEMO DATA — FRP: 55.0 MW', lat: 52.1, lng: -122.8, timestamp: new Date().toISOString(), severity: 'high', source: 'NASA FIRMS (Demo)', metadata: { isDemo: true, frp: 55.0 } },
    { id: 'wf-demo-7', type: 'wildfire', title: 'Wildfire — Mediterranean Turkey', description: 'DEMO DATA — FRP: 78.9 MW', lat: 37.0, lng: 29.0, timestamp: new Date().toISOString(), severity: 'high', source: 'NASA FIRMS (Demo)', metadata: { isDemo: true, frp: 78.9 } },
    { id: 'wf-demo-8', type: 'wildfire', title: 'Wildfire — Sub-Saharan Africa', description: 'DEMO DATA — FRP: 22.4 MW', lat: 5.0, lng: 20.0, timestamp: new Date().toISOString(), severity: 'low', source: 'NASA FIRMS (Demo)', metadata: { isDemo: true, frp: 22.4 } },
  ];
}
