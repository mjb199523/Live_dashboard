/** Scheduled data refresh jobs */

import cron from 'node-cron';
import { fetchEarthquakes } from './sources/usgs.js';
import { fetchDisasters } from './sources/gdacs.js';
import { fetchNews } from './sources/rss.js';
import { fetchFlights } from './sources/opensky.js';
import { fetchWildfires } from './sources/firms.js';
import { computeCII } from './cii.js';

export function startCronJobs() {
  console.log('[CRON] Starting scheduled data refresh jobs...');

  // Earthquakes — every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] Refreshing earthquake data...');
    try { await fetchEarthquakes(); } catch (e) { console.error('[CRON] Earthquake refresh failed:', e); }
  });

  // Disasters — every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('[CRON] Refreshing disaster data...');
    try { await fetchDisasters(); } catch (e) { console.error('[CRON] Disaster refresh failed:', e); }
  });

  // News — every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] Refreshing news data...');
    try { await fetchNews(); } catch (e) { console.error('[CRON] News refresh failed:', e); }
  });

  // Flights — every 2 minutes
  cron.schedule('*/2 * * * *', async () => {
    console.log('[CRON] Refreshing flight data...');
    try { await fetchFlights(); } catch (e) { console.error('[CRON] Flight refresh failed:', e); }
  });

  // Wildfires — every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('[CRON] Refreshing wildfire data...');
    try { await fetchWildfires(); } catch (e) { console.error('[CRON] Wildfire refresh failed:', e); }
  });

  // CII — every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('[CRON] Recomputing CII scores...');
    try { await computeCII(); } catch (e) { console.error('[CRON] CII computation failed:', e); }
  });

  // Initial warm-up fetch
  console.log('[CRON] Running initial data warm-up...');
  Promise.allSettled([
    fetchEarthquakes(),
    fetchDisasters(),
    fetchNews(),
    fetchWildfires(),
  ]).then((results) => {
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`[CRON] Initial warm-up: ${succeeded}/${results.length} sources loaded`);
  });

  computeCII().catch(e => console.error('[CRON] Initial CII computation failed:', e));
}
