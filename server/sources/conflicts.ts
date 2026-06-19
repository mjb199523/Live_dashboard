import Parser from 'rss-parser';

export interface ConflictEvent {
  id: string;
  type: 'conflict' | 'protest';
  title: string;
  description: string;
  lat: number;
  lng: number;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
}

const parser = new Parser();
const RELIEFWEB_RSS = 'https://reliefweb.int/updates/rss.xml';

// A simple dictionary to map countries found in titles to approximate coordinates for map placement
const COUNTRY_COORDS: Record<string, [number, number]> = {
  'Sudan': [15.0, 30.0],
  'Ukraine': [48.4, 31.2],
  'Gaza': [31.4, 34.4],
  'Palestine': [31.9, 35.2],
  'Israel': [31.0, 34.8],
  'Lebanon': [33.9, 35.8],
  'Syria': [35.0, 38.0],
  'Yemen': [15.5, 48.0],
  'Myanmar': [21.0, 96.0],
  'Congo': [-4.0, 21.0],
  'DRC': [-4.0, 21.0],
  'Somalia': [5.0, 46.0],
  'Haiti': [19.0, -72.0],
  'Afghanistan': [33.0, 66.0],
  'Mali': [17.0, -4.0],
  'Burkina Faso': [12.0, -1.0],
  'Niger': [16.0, 8.0],
  'Nigeria': [10.0, 8.0],
  'Ethiopia': [9.0, 40.0],
};

export async function fetchConflicts(): Promise<ConflictEvent[]> {
  try {
    const feed = await parser.parseURL(RELIEFWEB_RSS);
    const events: ConflictEvent[] = [];

    // Process top 20 updates
    const items = feed.items.slice(0, 20);

    for (const item of items) {
      if (!item.title) continue;
      
      const title = item.title;
      const lowerTitle = title.toLowerCase();
      
      // Determine if it's conflict-related or disaster-related
      const isConflict = lowerTitle.includes('conflict') || 
                         lowerTitle.includes('war') || 
                         lowerTitle.includes('armed') ||
                         lowerTitle.includes('violence') ||
                         lowerTitle.includes('attack');
      
      // Attempt to geolocate based on country name in title
      let lat = 0;
      let lng = 0;
      let mapped = false;

      for (const [country, coords] of Object.entries(COUNTRY_COORDS)) {
        if (title.includes(country)) {
          lat = coords[0] + (Math.random() - 0.5) * 2; // Slight jitter to unstack points
          lng = coords[1] + (Math.random() - 0.5) * 2;
          mapped = true;
          break;
        }
      }

      // Default fallback coordinates if unmapped (placing in mid-Atlantic for visibility of unmapped, or just skipping them from map)
      if (!mapped) {
        lat = 0 + (Math.random() - 0.5) * 10;
        lng = -30 + (Math.random() - 0.5) * 10;
      }

      events.push({
        id: item.guid || Buffer.from(title).toString('base64').substring(0, 10),
        type: isConflict ? 'conflict' : 'protest', // Mapping generic humanitarian to protest icon for visual distinction
        title: title,
        description: item.contentSnippet?.substring(0, 150) + '...' || 'No description available',
        lat,
        lng,
        timestamp: item.isoDate || new Date().toISOString(),
        severity: isConflict ? 'high' : 'medium'
      });
    }

    return events;
  } catch (error) {
    console.error('[CONFLICTS] ReliefWeb RSS fetch error:', error);
    return [];
  }
}
