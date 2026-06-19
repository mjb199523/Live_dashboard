/** Energy Disruption Ticker — horizontal scrolling ticker */

import { DataPanel } from '../DataPanel';

const TICKER_ITEMS = [
  { icon: '⚡', text: 'Nord Stream 2 remains offline — capacity 0%' },
  { icon: '🔴', text: 'Greenstream pipeline disrupted — Libya → Italy' },
  { icon: '⚠️', text: 'Yamal-Europe pipeline operating at reduced capacity' },
  { icon: '🔧', text: 'Groningen Gas Storage under maintenance — Netherlands' },
  { icon: '🔴', text: 'TAPI Pipeline disrupted — Turkmenistan → India route' },
  { icon: '⚡', text: 'EastMed Pipeline project offline — Israel → Greece' },
  { icon: '✅', text: 'Trans-Adriatic Pipeline (TAP) fully operational' },
  { icon: '✅', text: 'Power of Siberia pipeline flowing at full capacity — Russia → China' },
  { icon: '⚠️', text: 'Colonial Pipeline monitoring elevated cybersecurity posture' },
  { icon: '✅', text: 'Baltic Pipe operational — Norway → Poland' },
];

export function EnergyTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; // Duplicate for seamless scroll

  return (
    <DataPanel
      title="Energy Disruption Ticker"
      loading={false}
      error={null}
      lastUpdated={new Date().toISOString()}
      isDemo={true}
      onRefresh={() => {}}
    >
      <div className="ticker">
        <div className="ticker__track">
          {items.map((item, i) => (
            <span key={i} className="ticker__item">
              {item.icon} {item.text}
              <span className="ticker__separator">│</span>
            </span>
          ))}
        </div>
      </div>
    </DataPanel>
  );
}
