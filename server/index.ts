/** Express API server — main entry point */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { startCronJobs } from './cron.js';

// Source fetchers
import { fetchEarthquakes } from './sources/usgs.js';
import { fetchDisasters } from './sources/gdacs.js';
import { fetchNews } from './sources/rss.js';
import { fetchFlights } from './sources/opensky.js';
import { fetchFlightTrack } from './sources/opensky_track.js';
import { fetchWildfires } from './sources/firms.js';

// Real Data Replacements
import { fetchPipelines } from './sources/pipelines.js';
import { fetchConflicts } from './sources/conflicts.js';
import { fetchMarketComposite } from './sources/markets.js';
import { fetchCommodities } from './sources/commodities.js';
import { fetchStorage } from './sources/storage.js';
import { fetchPorts } from './sources/ports.js';

import { computeCII } from './cii.js';
import { cache } from './cache.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

// ─── Health / Status ──────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const sources = [
    'usgs_earthquakes', 'gdacs_disasters', 'rss_news',
    'opensky_flights', 'firms_wildfires', 'cii_scores',
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
  for (const key of ['pipelines', 'conflicts', 'markets', 'storage', 'ports', 'commodities']) {
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

app.get('/api/wildfires', async (_req, res) => {
  try {
    const data = await fetchWildfires();
    const isDemo = !process.env.FIRMS_MAP_KEY;
    res.json({ data, meta: { source: 'NASA FIRMS', lastUpdated: cache.getTimestamp('firms_wildfires') || new Date().toISOString(), isDemo, count: data.length } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wildfires', data: [] });
  }
});

app.get('/api/pipelines', async (_req, res) => {
  try {
    const data = await fetchPipelines();
    res.json({ data, meta: { source: 'Static Geographic Data', lastUpdated: new Date().toISOString(), isDemo: false, count: data.length } });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch pipelines', data: [] }); }
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

app.get('/api/storage', async (_req, res) => {
  try {
    const data = await fetchStorage();
    res.json({ data, meta: { source: 'Static Geographic Data', lastUpdated: new Date().toISOString(), isDemo: false, count: data.length } });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch storage', data: [] }); }
});

app.get('/api/ports', async (_req, res) => {
  try {
    const data = await fetchPorts();
    res.json({ data, meta: { source: 'Static Geographic Data', lastUpdated: new Date().toISOString(), isDemo: false, count: data.length } });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch ports', data: [] }); }
});

app.get('/api/cii', async (_req, res) => {
  try {
    const data = await computeCII();
    res.json({ data, meta: { source: 'CII Engine', lastUpdated: cache.getTimestamp('cii_scores') || new Date().toISOString(), isDemo: false, count: data.length } });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch CII scores', data: [] }); }
});

// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ┌─────────────────────────────────────────┐`);
  console.log(`  │  Dashboard API Server                    │`);
  console.log(`  │  http://localhost:${PORT}                  │`);
  console.log(`  │  Health: http://localhost:${PORT}/api/health│`);
  console.log(`  └─────────────────────────────────────────┘\n`);
  startCronJobs();
});
