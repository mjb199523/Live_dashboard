/** Root application layout */

import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { MapView } from './components/MapView';
import { LayerPanel } from './components/LayerPanel';
import { MapLegend } from './components/MapLegend';
import { WorkspaceSwitcher } from './components/WorkspaceSwitcher';
import { PanelsGrid } from './components/PanelsGrid';
import { useWorkspaceStore } from './store/workspace';

export default function App() {
  const [bannerVisible, setBannerVisible] = useState(true);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const selectedCountryCode = useWorkspaceStore((s) => s.selectedCountryCode);
  const setSelectedCountry = useWorkspaceStore((s) => s.setSelectedCountry);

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
          <MapView onCountryClick={(code, name) => setSelectedCountry(code, name)} />
          <LayerPanel />
          <MapLegend />
        </div>

        <PanelsGrid enabledPanels={activeWorkspace.enabledPanels} />
      </div>

      <WorkspaceSwitcher />
    </>
  );
}
