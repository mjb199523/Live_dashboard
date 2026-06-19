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
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const selectedCountryCode = useWorkspaceStore((s) => s.selectedCountryCode);
  const setSelectedCountry = useWorkspaceStore((s) => s.setSelectedCountry);

  return (
    <>
      <TopBar workspaceName={activeWorkspace.name} />

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
