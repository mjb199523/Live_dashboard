/** Map layer definitions and metadata */

export interface LayerDef {
  id: string;
  label: string;
  color: string;
  icon: string;
  category: string;
}

export const LAYERS: LayerDef[] = [
  { id: 'cii', label: 'Country Instability', color: '#ff4444', icon: '🗺️', category: 'Geopolitical' },
  { id: 'conflicts', label: 'Conflicts & Protests', color: '#ff6b35', icon: '⚔️', category: 'Geopolitical' },
  { id: 'earthquakes', label: 'Earthquakes', color: '#ff8c00', icon: '🔶', category: 'Geophysical' },
  { id: 'wildfires', label: 'Wildfire Hotspots', color: '#ff4400', icon: '🔥', category: 'Geophysical' },
  { id: 'disasters', label: 'Disaster Alerts', color: '#ffd700', icon: '⚠️', category: 'Geophysical' },
  { id: 'flights', label: 'Aircraft Tracks', color: '#00d4ff', icon: '✈️', category: 'Aviation' },
  { id: 'pipelines', label: 'Oil & Gas Pipelines', color: '#a855f7', icon: '🔵', category: 'Energy' },
  { id: 'storage', label: 'Energy Storage', color: '#3b82f6', icon: '🏭', category: 'Energy' },
  { id: 'ports', label: 'Ports & Chokepoints', color: '#06b6d4', icon: '⚓', category: 'Maritime' },
];

export const LAYER_CATEGORIES = ['Geopolitical', 'Geophysical', 'Military', 'Energy', 'Maritime', 'Aviation'] as const;

export function getLayersByCategory(category: string): LayerDef[] {
  return LAYERS.filter((l) => l.category === category);
}
