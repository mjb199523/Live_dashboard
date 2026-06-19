/** Bottom-left map legend showing currently enabled layers */

import { LAYERS } from '../config/layers';
import { useLayerStore } from '../store/layers';

export function MapLegend() {
  const enabledLayers = useLayerStore((s) => s.enabledLayers);
  const activeLayers = LAYERS.filter((l) => enabledLayers.has(l.id));

  if (!activeLayers.length) return null;

  return (
    <div className="map-legend">
      {activeLayers.map((layer) => (
        <div key={layer.id} className="map-legend__item">
          <span className="map-legend__dot" style={{ backgroundColor: layer.color }} />
          <span>{layer.label}</span>
        </div>
      ))}
    </div>
  );
}
