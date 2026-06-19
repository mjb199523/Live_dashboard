/** Protests & Conflicts scrollable feed */

import { useDataFetch } from '../../hooks/useDataFetch';
import { DataPanel } from '../DataPanel';
import { timeAgo } from '../../utils/formatters';

interface ConflictEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  severity: string;
}

export function ProtestsConflicts() {
  const { data, loading, error, lastUpdated, isDemo, refresh } = useDataFetch<ConflictEvent[]>('/api/conflicts', 300000);

  return (
    <DataPanel
      title="Protests & Conflicts"
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      isDemo={isDemo}
      onRefresh={refresh}
    >
      {data && data.length > 0 ? (
        data.map((event) => (
          <div key={event.id} className="event-item">
            <div className={`event-item__icon event-item__icon--${event.type}`}>
              {event.type === 'conflict' ? '⚔️' : '📢'}
            </div>
            <div className="event-item__content">
              <div className="event-item__title">{event.title}</div>
              <div className="event-item__desc">{event.description.replace('DEMO DATA — ', '')}</div>
            </div>
            <div className="event-item__time">{timeAgo(event.timestamp)}</div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">⚔️</div>
          <div className="empty-state__text">No conflict data available</div>
        </div>
      )}
    </DataPanel>
  );
}
