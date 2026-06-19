/** Ports & Chokepoints panel */

import { useDataFetch } from '../../hooks/useDataFetch';
import { DataPanel } from '../DataPanel';

interface Port {
  id: string;
  name: string;
  country: string;
  type: string;
  throughputMtpa: number;
}

export function PortsPanel() {
  const { data, loading, error, lastUpdated, isDemo, refresh } = useDataFetch<Port[]>('/api/ports', 600000);

  return (
    <DataPanel
      title="Ports & Chokepoints"
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
              <th>Name</th>
              <th>Country</th>
              <th>Type</th>
              <th>Throughput</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</td>
                <td>{p.country}</td>
                <td>
                  <span className={`status-badge ${p.type === 'chokepoint' ? 'status-badge--disrupted' : p.type === 'canal' ? 'status-badge--reduced' : 'status-badge--operational'}`}>
                    {p.type}
                  </span>
                </td>
                <td>{p.throughputMtpa.toLocaleString()} MTPA</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">⚓</div>
          <div className="empty-state__text">No port data available</div>
        </div>
      )}
    </DataPanel>
  );
}
