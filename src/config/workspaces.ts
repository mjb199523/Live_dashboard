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
    enabledLayers: ['conflicts', 'earthquakes', 'disasters', 'flights'],
    enabledPanels: ['news', 'conflicts', 'flights'],
    defaultCenter: [30, 30],
    defaultZoom: 2.5,
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain Risk',
    description: 'Routes, chokepoints, country risk, and commodities',
    icon: '🚢',
    enabledLayers: ['conflicts'],
    enabledPanels: ['commodities', 'news'],
    defaultCenter: [50, 25],
    defaultZoom: 2,
  },
  {
    id: 'energy',
    name: 'Energy Security',
    description: 'Pipelines, storage, tankers, outages, and disruption logs',
    icon: '⚡',
    enabledLayers: [],
    enabledPanels: ['commodities'],
    defaultCenter: [40, 30],
    defaultZoom: 2,
  },
  {
    id: 'news',
    name: 'News Desk',
    description: 'Breaking news, source compare, webcams, advisories, and social signals',
    icon: '📰',
    enabledLayers: ['earthquakes', 'disasters', 'conflicts'],
    enabledPanels: ['news', 'live-news', 'conflicts'],
    defaultCenter: [0, 20],
    defaultZoom: 2,
  },
  {
    id: 'markets',
    name: 'Markets',
    description: 'Quotes, market breadth, earnings, macro signals, and event calendar',
    icon: '📊',
    enabledLayers: [],
    enabledPanels: ['markets', 'commodities', 'news'],
    defaultCenter: [0, 30],
    defaultZoom: 2,
  },
  {
    id: 'tech',
    name: 'Tech Watch',
    description: 'AI labs, startups, chips, cloud, cyber, and regulation signals',
    icon: '🤖',
    enabledLayers: ['flights', 'earthquakes'],
    enabledPanels: ['news', 'live-news', 'markets'],
    defaultCenter: [-40, 40],
    defaultZoom: 2,
  },
  {
    id: 'good-news',
    name: 'Good News',
    description: 'Progress, breakthroughs, conservation wins, and clean-energy momentum',
    icon: '🌱',
    enabledLayers: ['earthquakes'],
    enabledPanels: ['news', 'markets'],
    defaultCenter: [0, 20],
    defaultZoom: 2,
  },
  {
    id: 'aviation',
    name: 'Global Aviation',
    description: 'Live aircraft tracking, global air traffic, and airspace disruptions',
    icon: '✈️',
    enabledLayers: ['flights', 'earthquakes', 'conflicts'],
    enabledPanels: ['flights', 'news'],
    defaultCenter: [10, 45],
    defaultZoom: 3,
  },
];

export function getWorkspaceById(id: string): WorkspacePreset {
  return WORKSPACES.find((w) => w.id === id) || WORKSPACES[0];
}
