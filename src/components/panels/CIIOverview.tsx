/** CII Overview panel — country instability rankings */

import { useDataFetch } from '../../hooks/useDataFetch';
import { DataPanel } from '../DataPanel';
import { ciiColor, ciiLabel } from '../../utils/formatters';

interface CIIScore {
  countryCode: string;
  countryName: string;
  score: number;
}

export function CIIOverview() {
  const { data, loading, error, lastUpdated, isDemo, refresh } = useDataFetch<CIIScore[]>('/api/cii', 900000);

  const sorted = data ? [...data].sort((a, b) => b.score - a.score) : [];

  return (
    <DataPanel
      title="Instability Index"
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      isDemo={isDemo}
      onRefresh={refresh}
    >
      {sorted.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Country</th>
              <th>Score</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 25).map((c, i) => (
              <tr key={c.countryCode}>
                <td>{i + 1}</td>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.countryName}</td>
                <td style={{ color: ciiColor(c.score), fontWeight: 700 }}>{c.score}</td>
                <td>
                  <span style={{
                    color: ciiColor(c.score),
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {ciiLabel(c.score)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">🗺️</div>
          <div className="empty-state__text">No instability data available</div>
        </div>
      )}
    </DataPanel>
  );
}
