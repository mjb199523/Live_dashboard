/** Commodities Watch panel */

import { useDataFetch } from '../../hooks/useDataFetch';
import { DataPanel } from '../DataPanel';
import { trendArrow } from '../../utils/formatters';

interface CommodityPrice {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  changePercent: number;
  trend: string;
}

export function CommoditiesWatch() {
  const { data, loading, error, lastUpdated, isDemo, refresh } = useDataFetch<CommodityPrice[]>('/api/commodities', 300000);

  return (
    <DataPanel
      title="Commodities Watch"
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
              <th>Commodity</th>
              <th>Price</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td style={{ color: 'var(--text-primary)' }}>{c.name}</td>
                <td>{c.price.toLocaleString()} {c.currency}</td>
                <td>
                  <span className={`trend-arrow trend-arrow--${c.trend === 'up' ? 'worsening' : c.trend === 'down' ? 'improving' : 'stable'}`} style={{ color: c.trend === 'up' ? '#00ff88' : c.trend === 'down' ? '#ff4444' : '#6b7a8d'}}>
                    {trendArrow(c.trend)} {Math.abs(c.changePercent)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">⛽</div>
          <div className="empty-state__text">No commodity data available</div>
        </div>
      )}
    </DataPanel>
  );
}
