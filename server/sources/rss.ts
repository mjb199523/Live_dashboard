/** RSS news feed aggregator — REAL DATA, no API key required */

import RssParser from 'rss-parser';
import { cache } from '../cache.js';
import type { NewsItem } from './types.js';

const CACHE_KEY = 'rss_news';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const FEEDS = [
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
  { name: 'BBC Science', url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', category: 'science' },
  { name: 'Reuters World', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best', category: 'world' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world' },
  { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', category: 'general' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech' },
  { name: 'AP News', url: 'https://rsshub.app/apnews/topics/apf-topnews', category: 'world' },
];

const parser = new RssParser({
  timeout: 4000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

async function fetchSingleFeed(feed: typeof FEEDS[number]): Promise<NewsItem[]> {
  try {
    const result = await parser.parseURL(feed.url);
    return (result.items || []).slice(0, 15).map((item, i) => ({
      id: `rss-${feed.name.toLowerCase().replace(/\s/g, '-')}-${i}-${Date.now()}`,
      title: item.title || 'Untitled',
      source: feed.name,
      url: item.link || '',
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      summary: item.contentSnippet?.slice(0, 200) || item.content?.slice(0, 200) || undefined,
      category: feed.category,
    }));
  } catch (err) {
    console.warn(`[RSS] Failed to fetch ${feed.name}:`, (err as Error).message);
    return [];
  }
}

export async function fetchNews(): Promise<NewsItem[]> {
  const cached = cache.get<NewsItem[]>(CACHE_KEY);
  if (cached) return cached;

  try {
    const results = await Promise.allSettled(FEEDS.map(fetchSingleFeed));
    const allItems: NewsItem[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
      }
    }

    // Sort by date, newest first
    allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    cache.set(CACHE_KEY, allItems, CACHE_TTL);
    return allItems;
  } catch (err) {
    console.error('[RSS] Aggregation error:', err);
    return cache.get<NewsItem[]>(CACHE_KEY) ?? [];
  }
}
