/** Dynamic panels grid — renders panels based on workspace config */

import { NewsIntelligence } from './panels/NewsIntelligence';
import { LiveNewsFeeds } from './panels/LiveNewsFeeds';
import { PipelineStatus } from './panels/PipelineStatus';
import { StorageAtlas } from './panels/StorageAtlas';
import { CommoditiesWatch } from './panels/CommoditiesWatch';
import { MarketComposite } from './panels/MarketComposite';
import { ProtestsConflicts } from './panels/ProtestsConflicts';
import { MilitaryFlights } from './panels/MilitaryFlights';
import { CIIOverview } from './panels/CIIOverview';
import { PortsPanel } from './panels/PortsPanel';
import { EnergyTicker } from './panels/EnergyTicker';

interface PanelsGridProps {
  enabledPanels: string[];
}

const PANEL_MAP: Record<string, () => JSX.Element> = {
  'news': () => <NewsIntelligence />,
  'live-news': () => <LiveNewsFeeds />,
  'pipelines': () => <PipelineStatus />,
  'storage': () => <StorageAtlas />,
  'commodities': () => <CommoditiesWatch />,
  'markets': () => <MarketComposite />,
  'conflicts': () => <ProtestsConflicts />,
  'flights': () => <MilitaryFlights />,
  'cii': () => <CIIOverview />,
  'ports': () => <PortsPanel />,
  'ticker': () => <EnergyTicker />,
};

export function PanelsGrid({ enabledPanels }: PanelsGridProps) {
  return (
    <div className="panels-container">
      {enabledPanels.map((panelId) => {
        const render = PANEL_MAP[panelId];
        if (!render) return null;
        return <div key={panelId}>{render()}</div>;
      })}
    </div>
  );
}
