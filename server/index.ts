/** Express API server — main entry point */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { startCronJobs } from './cron.js';

import { fetchEarthquakes } from './sources/usgs.js';
import { fetchDisasters } from './sources/gdacs.js';
import { fetchNews } from './sources/rss.js';
import { fetchFlights } from './sources/opensky.js';
import { fetchFlightTrack } from './sources/opensky_track.js';

// Real Data Replacements
import { fetchConflicts } from './sources/conflicts.js';
import { fetchMarketComposite } from './sources/markets.js';
import { fetchCommodities } from './sources/commodities.js';

import { cache } from './cache.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

// ─── Health / Status ──────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const sources = [
    'usgs_earthquakes', 'gdacs_disasters', 'rss_news',
    'opensky_flights',
  ];

  const status: Record<string, object> = {};
  for (const key of sources) {
    const hasData = cache.has(key);
    status[key] = {
      status: hasData ? 'LIVE' : cache.getTimestamp(key) ? 'STALE' : 'EMPTY',
      lastUpdated: cache.getTimestamp(key),
      ageMinutes: cache.getAge(key),
      isDemo: false,
    };
  }

  // Other real sources that are queried on-demand or use static data
  for (const key of ['conflicts', 'markets', 'commodities']) {
    status[key] = { status: 'LIVE', lastUpdated: new Date().toISOString(), ageMinutes: 0, isDemo: false };
  }

  res.json(status);
});

// ─── Real Data Endpoints ──────────────────────────────────
app.get('/api/earthquakes', async (_req, res) => {
  try {
    const data = await fetchEarthquakes();
    res.json({ data, meta: { source: 'USGS', lastUpdated: cache.getTimestamp('usgs_earthquakes') || new Date().toISOString(), isDemo: false, count: data.length } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch earthquakes', data: [] });
  }
});

app.get('/api/disasters', async (_req, res) => {
  try {
    const data = await fetchDisasters();
    res.json({ data, meta: { source: 'GDACS', lastUpdated: cache.getTimestamp('gdacs_disasters') || new Date().toISOString(), isDemo: false, count: data.length } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disasters', data: [] });
  }
});

app.get('/api/news', async (_req, res) => {
  try {
    const data = await fetchNews();
    res.json({ data, meta: { source: 'RSS Feeds', lastUpdated: cache.getTimestamp('rss_news') || new Date().toISOString(), isDemo: false, count: data.length } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news', data: [] });
  }
});

app.get('/api/flights', async (_req, res) => {
  try {
    const data = await fetchFlights();
    res.json({ data, meta: { source: 'OpenSky Network', lastUpdated: cache.getTimestamp('opensky_flights') || new Date().toISOString(), isDemo: false, count: data.length } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flights', data: [] });
  }
});

app.get('/api/flights/:icao24/track', async (req, res) => {
  try {
    const data = await fetchFlightTrack(req.params.icao24);
    if (!data) {
      return res.status(404).json({ error: 'Track not found or rate limited', data: null });
    }
    res.json({ data, meta: { source: 'OpenSky Network', lastUpdated: new Date().toISOString(), isDemo: false, count: data.path.length } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch track', data: null });
  }
});


app.get('/api/conflicts', async (_req, res) => {
  try {
    const data = await fetchConflicts();
    res.json({ data, meta: { source: 'ReliefWeb', lastUpdated: new Date().toISOString(), isDemo: false, count: data.length } });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch conflicts', data: [] }); }
});

app.get('/api/markets', async (_req, res) => {
  try {
    const data = await fetchMarketComposite();
    res.json({ data, meta: { source: 'Yahoo Finance', lastUpdated: new Date().toISOString(), isDemo: false, count: data.signals.length } });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch markets', data: null }); }
});

app.get('/api/commodities', async (_req, res) => {
  try {
    const data = await fetchCommodities();
    res.json({ data, meta: { source: 'Yahoo Finance', lastUpdated: new Date().toISOString(), isDemo: false, count: data.length } });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch commodities', data: [] }); }
});


// ─── Start Server ─────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n  ┌─────────────────────────────────────────┐`);
    console.log(`  │  Dashboard API Server                    │`);
    console.log(`  │  http://localhost:${PORT}                  │`);
    console.log(`  │  Health: http://localhost:${PORT}/api/health│`);
    console.log(`  └─────────────────────────────────────────┘\n`);
    startCronJobs();
  });
}

export default app;
