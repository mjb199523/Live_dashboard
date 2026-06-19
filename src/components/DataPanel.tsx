/** Generic panel wrapper with loading/error/refresh states */

import { type ReactNode } from 'react';
import { timeAgo } from '../utils/formatters';

interface DataPanelProps {
  title: string;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  isDemo: boolean;
  onRefresh: () => void;
  children: ReactNode;
}

export function DataPanel({ title, loading, error, lastUpdated, isDemo, onRefresh, children }: DataPanelProps) {
  return (
    <div className="panel-card">
      <div className="panel-card__header">
        <div className="panel-card__title">
          {title}
          {isDemo && <span className="panel-card__badge">Demo Data</span>}
        </div>
        <div className="panel-card__meta">
          {lastUpdated && (
            <span className="panel-card__timestamp">{timeAgo(lastUpdated)}</span>
          )}
          <button className="panel-card__refresh" onClick={onRefresh} title="Refresh">
            ⟳
          </button>
        </div>
      </div>

      <div className="panel-card__body">
        {loading && !error && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <span className="loading-text">Loading data...</span>
          </div>
        )}

        {error && !loading && (
          <div className="error-state">
            <span className="error-state__text">⚠ {error}</span>
            <button className="panel-card__refresh" onClick={onRefresh} style={{ fontSize: '0.8rem', marginTop: 8 }}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && children}
      </div>
    </div>
  );
}
