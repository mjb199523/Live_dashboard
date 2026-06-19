/** Workspace presets — defines which layers + panels are visible per workspace */

export interface WorkspacePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabledLayers: string[];
  enabledPanels: string[];
  defaultCenter: [number, number];
  defaultZoom: number;
}

export const WORKSPACES: WorkspacePreset[] = [
  {
    id: 'crisis',
    name: 'Crisis Desk',
    description: 'Conflict, posture, instability, and live intelligence',
    icon: '🔴',
    enabledLayers: ['conflicts', 'earthquakes', 'disasters', 'cii', 'flights', 'wildfires'],
    enabledPanels: ['news', 'conflicts', 'flights', 'cii'],
    defaultCenter: [30, 30],
    defaultZoom: 2.5,
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain Risk',
    description: 'Routes, chokepoints, country risk, and commodities',
    icon: '🚢',
    enabledLayers: ['ports', 'pipelines', 'cii', 'conflicts'],
    enabledPanels: ['pipelines', 'ports', 'commodities', 'news'],
    defaultCenter: [50, 25],
    defaultZoom: 2,
  },
  {
    id: 'energy',
    name: 'Energy Security',
    description: 'Pipelines, storage, tankers, outages, and disruption logs',
    icon: '⚡',
    enabledLayers: ['pipelines', 'storage', 'ports', 'wildfires'],
    enabledPanels: ['pipelines', 'storage', 'commodities', 'ticker'],
    defaultCenter: [40, 30],
    defaultZoom: 2,
  },
  {
    id: 'news',
    name: 'News Desk',
    description: 'Breaking news, source compare, webcams, advisories, and social signals',
    icon: '📰',
    enabledLayers: ['earthquakes', 'disasters', 'wildfires', 'conflicts'],
    enabledPanels: ['news', 'live-news', 'conflicts', 'ticker'],
    defaultCenter: [0, 20],
    defaultZoom: 2,
  },
  {
    id: 'markets',
    name: 'Markets',
    description: 'Quotes, market breadth, earnings, macro signals, and event calendar',
    icon: '📊',
    enabledLayers: ['ports', 'pipelines', 'cii'],
    enabledPanels: ['markets', 'commodities', 'news', 'ticker'],
    defaultCenter: [0, 30],
    defaultZoom: 2,
  },
  {
    id: 'tech',
    name: 'Tech Watch',
    description: 'AI labs, startups, chips, cloud, cyber, and regulation signals',
    icon: '🤖',
    enabledLayers: ['flights', 'earthquakes'],
    enabledPanels: ['news', 'live-news', 'markets', 'ticker'],
    defaultCenter: [-40, 40],
    defaultZoom: 2,
  },
  {
    id: 'good-news',
    name: 'Good News',
    description: 'Progress, breakthroughs, conservation wins, and clean-energy momentum',
    icon: '🌱',
    enabledLayers: ['wildfires', 'earthquakes', 'storage'],
    enabledPanels: ['news', 'storage', 'ticker', 'markets'],
    defaultCenter: [0, 20],
    defaultZoom: 2,
  },
  {
    id: 'aviation',
    name: 'Global Aviation',
    description: 'Live aircraft tracking, global air traffic, and airspace disruptions',
    icon: '✈️',
    enabledLayers: ['flights', 'wildfires', 'earthquakes', 'conflicts'],
    enabledPanels: ['flights', 'news', 'ticker'],
    defaultCenter: [10, 45],
    defaultZoom: 3,
  },
];

export function getWorkspaceById(id: string): WorkspacePreset {
  return WORKSPACES.find((w) => w.id === id) || WORKSPACES[0];
}
