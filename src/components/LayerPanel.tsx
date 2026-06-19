/** Left-side layer toggle panel */

import { useState } from 'react';
import { LAYERS, LAYER_CATEGORIES, getLayersByCategory } from '../config/layers';
import { useLayerStore } from '../store/layers';

export function LayerPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const { enabledLayers, toggleLayer } = useLayerStore();

  return (
    <div className={`layer-panel ${collapsed ? 'layer-panel--collapsed' : ''}`}>
      <div className="layer-panel__header">
        <span className="layer-panel__title">Layers</span>
        <button
          className="layer-panel__toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {!collapsed && LAYER_CATEGORIES.map((category) => {
        const categoryLayers = getLayersByCategory(category);
        if (!categoryLayers.length) return null;

        return (
          <div key={category} className="layer-panel__group">
            <div className="layer-panel__group-label">{category}</div>
            {categoryLayers.map((layer) => (
              <label key={layer.id} className="layer-panel__item">
                <input
                  type="checkbox"
                  className="layer-panel__checkbox"
                  checked={enabledLayers.has(layer.id)}
                  onChange={() => toggleLayer(layer.id)}
                />
                <span
                  className="layer-panel__dot"
                  style={{ backgroundColor: layer.color }}
                />
                <span>{layer.label}</span>
              </label>
            ))}
          </div>
        );
      })}
    </div>
  );
}
