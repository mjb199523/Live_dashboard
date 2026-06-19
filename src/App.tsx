/** Root application layout */

import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { MapView } from './components/MapView';
import { LayerPanel } from './components/LayerPanel';
import { MapLegend } from './components/MapLegend';
import { WorkspaceSwitcher } from './components/WorkspaceSwitcher';
import { CountryDetailPanel } from './components/CountryDetailPanel';
import { PanelsGrid } from './components/PanelsGrid';
import { useWorkspaceStore } from './store/workspace';

export default function App() {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  return (
    <>
      <TopBar workspaceName={activeWorkspace.name} />

      {bannerVisible && (
        <div className="banner">
          <div className="banner__text">
            <span className="banner__badge">INFO</span>
            <span>
              Dashboard v1.0 — Local-first intelligence monitor. Some data sources use demo/seed data. 
              See .env.example for optional API keys.
            </span>
          </div>
          <button className="banner__dismiss" onClick={() => setBannerVisible(false)}>✕</button>
        </div>
      )}

      <div className="main-layout">
        <div className="map-container">
          <MapView onCountryClick={setSelectedCountry} />
          <LayerPanel />
          <MapLegend />
        </div>

        <PanelsGrid enabledPanels={activeWorkspace.enabledPanels} />
      </div>

      <WorkspaceSwitcher />

      <CountryDetailPanel
        countryCode={selectedCountry}
        onClose={() => setSelectedCountry(null)}
      />
    </>
  );
}
