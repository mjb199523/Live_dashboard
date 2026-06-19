/** Country detail slide-in panel for CII breakdown */

import { useDataFetch } from '../hooks/useDataFetch';
import { ciiColor, ciiLabel } from '../utils/formatters';

interface CIIScore {
  countryCode: string;
  countryName: string;
  score: number;
  breakdown: {
    conflict: number;
    protest: number;
    economic: number;
    military: number;
    infrastructure: number;
  };
  recentEvents: Array<{ title: string; type: string; timestamp: string }>;
}

interface CountryDetailPanelProps {
  countryCode: string | null;
  onClose: () => void;
}

export function CountryDetailPanel({ countryCode, onClose }: CountryDetailPanelProps) {
  const { data: ciiData } = useDataFetch<CIIScore[]>('/api/cii', 900000);

  const country = ciiData?.find((c) => c.countryCode === countryCode);

  const breakdownItems = country ? [
    { label: 'Conflict Events', value: country.breakdown.conflict, weight: '40%', color: '#ff4444' },
    { label: 'Protest/Unrest', value: country.breakdown.protest, weight: '20%', color: '#ffd700' },
    { label: 'Economic Stress', value: country.breakdown.economic, weight: '15%', color: '#ff8c00' },
    { label: 'Military Posture', value: country.breakdown.military, weight: '15%', color: '#a855f7' },
    { label: 'Infrastructure', value: country.breakdown.infrastructure, weight: '10%', color: '#3b82f6' },
  ] : [];

  return (
    <div className={`country-panel ${countryCode ? 'country-panel--open' : ''}`}>
      {country && (
        <>
          <div className="country-panel__header">
            <div className="country-panel__title">{country.countryName}</div>
            <button className="country-panel__close" onClick={onClose}>✕</button>
          </div>

          <div className="country-panel__score">
            <div
              className="country-panel__score-value"
              style={{ color: ciiColor(country.score) }}
            >
              {country.score}
            </div>
            <div className="country-panel__score-label">
              Instability Index — {ciiLabel(country.score)}
            </div>
          </div>

          <div className="country-panel__breakdown">
            {breakdownItems.map((item) => (
              <div key={item.label} className="country-panel__bar">
                <div className="country-panel__bar-label">
                  <span>{item.label} ({item.weight})</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: item.color }}>{item.value}</span>
                </div>
                <div className="country-panel__bar-track">
                  <div
                    className="country-panel__bar-fill"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {country.recentEvents.length > 0 && (
            <div className="country-panel__events">
              <div className="country-panel__events-title">Recent Contributing Events</div>
              {country.recentEvents.map((event, i) => (
                <div key={i} className="event-item">
                  <div className={`event-item__icon event-item__icon--${event.type}`}>
                    {event.type === 'conflict' ? '⚔️' : '📢'}
                  </div>
                  <div className="event-item__content">
                    <div className="event-item__title">{event.title}</div>
                    <div className="event-item__desc">{event.type}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
