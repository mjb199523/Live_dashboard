/** Market Composite gauge widget */

import { useDataFetch } from '../../hooks/useDataFetch';
import { DataPanel } from '../DataPanel';
import { trendArrow } from '../../utils/formatters';

interface MarketSignal {
  name: string;
  value: number;
  trend: string;
  weight: number;
}

interface MarketData {
  signals: MarketSignal[];
  composite: number;
}

function getCompositeColor(score: number): string {
  if (score >= 70) return '#00ff88';
  if (score >= 50) return '#ffd700';
  if (score >= 30) return '#ff8c00';
  return '#ff4444';
}

function getBarColor(value: number): string {
  if (value >= 60) return '#00ff88';
  if (value >= 40) return '#ffd700';
  return '#ff4444';
}

export function MarketComposite() {
  const { data, loading, error, lastUpdated, isDemo, refresh } = useDataFetch<MarketData>('/api/markets', 300000);

  return (
    <DataPanel
      title="Market Composite"
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      isDemo={isDemo}
      onRefresh={refresh}
    >
      {data ? (
        <>
          <div className="gauge-container">
            <div className="gauge">
              <div className="gauge__arc" />
              <div className="gauge__value" style={{ color: getCompositeColor(data.composite) }}>
                {data.composite}
              </div>
            </div>
            <div className="gauge__label">Composite Score</div>
          </div>

          <div className="gauge-signals">
            {data.signals.map((signal) => (
              <div key={signal.name} className="gauge-signal">
                <span className="gauge-signal__name">{signal.name}</span>
                <div className="gauge-signal__bar-track">
                  <div
                    className="gauge-signal__bar-fill"
                    style={{
                      width: `${signal.value}%`,
                      backgroundColor: getBarColor(signal.value),
                    }}
                  />
                </div>
                <span className="gauge-signal__value">
                  <span className={`trend-arrow trend-arrow--${signal.trend === 'up' ? 'improving' : signal.trend === 'down' ? 'worsening' : 'stable'}`}>
                    {trendArrow(signal.trend)}
                  </span>
                  {' '}{signal.value}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">📊</div>
          <div className="empty-state__text">No market data available</div>
        </div>
      )}
    </DataPanel>
  );
}
