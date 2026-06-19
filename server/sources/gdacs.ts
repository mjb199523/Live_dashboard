/** GDACS disaster alerts fetcher — REAL DATA, no API key required */

import { cache } from '../cache.js';
import type { NormalizedEvent } from './types.js';

const CACHE_KEY = 'gdacs_disasters';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const API_URL = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?alertlevel=Green;Orange;Red&eventlist=EQ;TC;FL;VO;WF;DR&fromDate=';

function alertToSeverity(alert: string): NormalizedEvent['severity'] {
  switch (alert?.toLowerCase()) {
    case 'red': return 'critical';
    case 'orange': return 'high';
    case 'green': return 'medium';
    default: return 'low';
  }
}

function eventTypeLabel(type: string): string {
  const map: Record<string, string> = {
    EQ: 'Earthquake', TC: 'Tropical Cyclone', FL: 'Flood',
    VO: 'Volcano', WF: 'Wildfire', DR: 'Drought',
  };
  return map[type] || type;
}

export async function fetchDisasters(): Promise<NormalizedEvent[]> {
  const cached = cache.get<NormalizedEvent[]>(CACHE_KEY);
  if (cached) return cached;

  try {
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const res = await fetch(`${API_URL}${fromDate}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`GDACS API returned ${res.status}`);

    const data = await res.json() as {
      features: Array<{
        properties: {
          eventid: number;
          eventtype: string;
          name: string;
          description: string;
          htmldescription: string;
          alertlevel: string;
          alertscore: number;
          fromdate: string;
          todate: string;
          country: string;
          iso3: string;
          url: { report: string };
        };
        geometry: {
          type: string;
          coordinates: [number, number];
        };
      }>;
    };

    const features = data?.features || [];
    const events: NormalizedEvent[] = features.map((f) => ({
      id: `gdacs-${f.properties.eventid}`,
      type: f.properties.eventtype?.toLowerCase() || 'disaster',
      title: `${eventTypeLabel(f.properties.eventtype)}: ${f.properties.name || f.properties.country || 'Unknown'}`,
      description: f.properties.description || f.properties.htmldescription || '',
      lat: f.geometry?.coordinates?.[1] ?? 0,
      lng: f.geometry?.coordinates?.[0] ?? 0,
      timestamp: f.properties.fromdate || new Date().toISOString(),
      severity: alertToSeverity(f.properties.alertlevel),
      source: 'GDACS',
      metadata: {
        eventType: eventTypeLabel(f.properties.eventtype),
        alertLevel: f.properties.alertlevel,
        alertScore: f.properties.alertscore,
        country: f.properties.country,
        iso3: f.properties.iso3,
        reportUrl: f.properties.url?.report,
      },
    }));

    cache.set(CACHE_KEY, events, CACHE_TTL);
    return events;
  } catch (err) {
    console.error('[GDACS] Fetch error:', err);
    return cache.get<NormalizedEvent[]>(CACHE_KEY) ?? [];
  }
}
