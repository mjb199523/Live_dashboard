/** Protests & Conflicts scrollable feed */

import { useDataFetch } from '../../hooks/useDataFetch';
import { useWorkspaceStore } from '../../store/workspace';
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
  const selectedCountryName = useWorkspaceStore((s) => s.selectedCountryName);

  let filteredData = data || [];
  if (selectedCountryName) {
    const query = selectedCountryName.toLowerCase();
    filteredData = filteredData.filter((e) => 
      e.description.toLowerCase().includes(query) || 
      e.title.toLowerCase().includes(query)
    );
  }

  return (
    <DataPanel
      title="Protests & Conflicts"
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      isDemo={isDemo}
      onRefresh={refresh}
    >
      {filteredData.length > 0 ? (
        filteredData.map((event) => (
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
