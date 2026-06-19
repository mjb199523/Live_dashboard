/** Live News Feeds panel — stream labels list */

import { DataPanel } from '../DataPanel';

const LIVE_FEEDS = [
  { name: 'Reuters Live', type: 'Wire Service', status: 'active' },
  { name: 'AP News Wire', type: 'Wire Service', status: 'active' },
  { name: 'BBC World Service', type: 'Broadcast', status: 'active' },
  { name: 'Al Jazeera English', type: 'Broadcast', status: 'active' },
  { name: 'France 24', type: 'Broadcast', status: 'active' },
  { name: 'DW News', type: 'Broadcast', status: 'active' },
  { name: 'NHK World', type: 'Broadcast', status: 'active' },
  { name: 'CGTN', type: 'Broadcast', status: 'active' },
  { name: 'TRT World', type: 'Broadcast', status: 'active' },
  { name: 'Liveuamap', type: 'OSINT Map', status: 'reference' },
];

export function LiveNewsFeeds() {
  return (
    <DataPanel
      title="Live News Feeds"
      loading={false}
      error={null}
      lastUpdated={new Date().toISOString()}
      isDemo={false}
      onRefresh={() => {}}
    >
      {LIVE_FEEDS.map((feed, i) => (
        <div key={i} className="event-item">
          <div className="event-item__icon" style={{ background: 'rgba(0, 255, 136, 0.15)', color: '#00ff88' }}>
            {feed.status === 'active' ? '●' : '○'}
          </div>
          <div className="event-item__content">
            <div className="event-item__title">{feed.name}</div>
            <div className="event-item__desc">{feed.type}</div>
          </div>
          <div className="event-item__time">
            <span className={`status-badge status-badge--${feed.status === 'active' ? 'operational' : 'reduced'}`}>
              {feed.status}
            </span>
          </div>
        </div>
      ))}
    </DataPanel>
  );
}
