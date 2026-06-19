/** Map layer definitions and metadata */

export interface LayerDef {
  id: string;
  label: string;
  color: string;
  icon: string;
  category: string;
}

export const LAYERS: LayerDef[] = [
  { id: 'conflicts', label: 'Conflicts & Protests', color: '#ff6b35', icon: '⚔️', category: 'Geopolitical' },
  { id: 'earthquakes', label: 'Earthquakes', color: '#ff8c00', icon: '🔶', category: 'Geophysical' },
  { id: 'disasters', label: 'Disaster Alerts', color: '#ffd700', icon: '⚠️', category: 'Geophysical' },
  { id: 'flights', label: 'Aircraft Tracks', color: '#00d4ff', icon: '✈️', category: 'Aviation' },
];

export const LAYER_CATEGORIES = ['Geopolitical', 'Geophysical', 'Military', 'Energy', 'Maritime', 'Aviation'] as const;

export function getLayersByCategory(category: string): LayerDef[] {
  return LAYERS.filter((l) => l.category === category);
}
