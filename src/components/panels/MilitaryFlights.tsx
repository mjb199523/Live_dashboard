/** Military Flights list panel */

import { useDataFetch } from '../../hooks/useDataFetch';
import { useWorkspaceStore } from '../../store/workspace';
import { DataPanel } from '../DataPanel';

interface Flight {
  icao24: string;
  callsign: string;
  originCountry: string;
  lat: number;
  lng: number;
  altitude: number;
  velocity: number;
  heading: number;
}

export function MilitaryFlights() {
  const { data, loading, error, lastUpdated, isDemo, refresh } = useDataFetch<Flight[]>('/api/flights', 120000);
  const selectedCountryName = useWorkspaceStore((s) => s.selectedCountryName);

  let flights = data || [];
  if (selectedCountryName) {
    const query = selectedCountryName.toLowerCase();
    flights = flights.filter((f) => f.originCountry && f.originCountry.toLowerCase().includes(query));
  }
  
  // Show first 30 flights
  flights = flights.slice(0, 30);

  return (
    <DataPanel
      title="Global Aviation"
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      isDemo={isDemo}
      onRefresh={refresh}
    >
      {flights.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Callsign</th>
              <th>Origin</th>
              <th>Alt (ft)</th>
              <th>Speed (kts)</th>
              <th>Heading</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((f) => (
              <tr key={f.icao24}>
                <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{f.callsign || f.icao24}</td>
                <td>{f.originCountry}</td>
                <td>{Math.round(f.altitude * 3.28084).toLocaleString()}</td>
                <td>{Math.round(f.velocity * 1.944)}</td>
                <td>{Math.round(f.heading)}°</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">✈️</div>
          <div className="empty-state__text">No flight data available. Rate limits may apply.</div>
        </div>
      )}
    </DataPanel>
  );
}
