/** Dynamic panels grid — renders panels based on workspace config */

import { NewsIntelligence } from './panels/NewsIntelligence';
import { LiveNewsFeeds } from './panels/LiveNewsFeeds';
import { CommoditiesWatch } from './panels/CommoditiesWatch';
import { MarketComposite } from './panels/MarketComposite';
import { ProtestsConflicts } from './panels/ProtestsConflicts';
import { MilitaryFlights } from './panels/MilitaryFlights';

interface PanelsGridProps {
  enabledPanels: string[];
}

const PANEL_MAP: Record<string, () => JSX.Element> = {
  'news': () => <NewsIntelligence />,
  'live-news': () => <LiveNewsFeeds />,
  'commodities': () => <CommoditiesWatch />,
  'markets': () => <MarketComposite />,
  'conflicts': () => <ProtestsConflicts />,
  'flights': () => <MilitaryFlights />,
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
