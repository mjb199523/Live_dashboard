/** Oil & Gas Pipeline Status panel */

import { useDataFetch } from '../../hooks/useDataFetch';
import { DataPanel } from '../DataPanel';

interface Pipeline {
  id: string;
  name: string;
  fromCountry: string;
  toCountry: string;
  capacityBcfYr: number;
  status: string;
}

export function PipelineStatus() {
  const { data, loading, error, lastUpdated, isDemo, refresh } = useDataFetch<Pipeline[]>('/api/pipelines', 600000);

  return (
    <DataPanel
      title="Pipeline Status"
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      isDemo={isDemo}
      onRefresh={refresh}
    >
      {data && data.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Pipeline</th>
              <th>Route</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</td>
                <td>{p.fromCountry} → {p.toCountry}</td>
                <td>{p.capacityBcfYr.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-badge--${p.status}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">🔵</div>
          <div className="empty-state__text">No pipeline data available</div>
        </div>
      )}
    </DataPanel>
  );
}
