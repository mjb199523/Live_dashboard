/** Strategic Storage Atlas panel */

import { useDataFetch } from '../../hooks/useDataFetch';
import { DataPanel } from '../DataPanel';

interface StorageFacility {
  id: string;
  name: string;
  country: string;
  type: string;
  capacityMbbls: number;
  status: string;
}

export function StorageAtlas() {
  const { data, loading, error, lastUpdated, isDemo, refresh } = useDataFetch<StorageFacility[]>('/api/storage', 600000);

  const typeLabel = (type: string) => {
    switch (type) {
      case 'petroleum': return 'Petroleum';
      case 'natural_gas': return 'Nat. Gas';
      case 'lng': return 'LNG';
      default: return type;
    }
  };

  return (
    <DataPanel
      title="Strategic Storage Atlas"
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
              <th>Facility</th>
              <th>Country</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((f) => (
              <tr key={f.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{f.name}</td>
                <td>{f.country}</td>
                <td>{typeLabel(f.type)}</td>
                <td>{f.capacityMbbls} Mbbls</td>
                <td>
                  <span className={`status-badge status-badge--${f.status}`}>
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">🏭</div>
          <div className="empty-state__text">No storage data available</div>
        </div>
      )}
    </DataPanel>
  );
}
