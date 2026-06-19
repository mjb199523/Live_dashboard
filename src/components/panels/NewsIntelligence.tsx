/** News Intelligence panel — aggregated headlines */

import { useDataFetch } from '../../hooks/useDataFetch';
import { DataPanel } from '../DataPanel';
import { timeAgo } from '../../utils/formatters';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary?: string;
  category?: string;
}

export function NewsIntelligence() {
  const { data, loading, error, lastUpdated, isDemo, refresh } = useDataFetch<NewsItem[]>('/api/news', 300000);

  return (
    <DataPanel
      title="News Intelligence"
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      isDemo={isDemo}
      onRefresh={refresh}
    >
      {data && data.length > 0 ? (
        data.slice(0, 20).map((item, i) => (
          <div key={item.id || i} className="news-item">
            <div
              className="news-item__title"
              onClick={() => item.url && window.open(item.url, '_blank')}
            >
              {item.title}
            </div>
            <div className="news-item__meta">
              <span className="news-item__source">{item.source}</span>
              <span>·</span>
              <span>{timeAgo(item.publishedAt)}</span>
              {item.category && (
                <>
                  <span>·</span>
                  <span>{item.category}</span>
                </>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">📰</div>
          <div className="empty-state__text">No news data available</div>
        </div>
      )}
    </DataPanel>
  );
}
