/** Zustand store for map layer toggles */

import { create } from 'zustand';

interface LayerState {
  enabledLayers: Set<string>;
  toggleLayer: (id: string) => void;
  setLayers: (ids: string[]) => void;
  isLayerEnabled: (id: string) => boolean;
}

export const useLayerStore = create<LayerState>((set, get) => ({
  enabledLayers: new Set(['earthquakes', 'conflicts', 'disasters', 'flights', 'cii', 'wildfires']),
  toggleLayer: (id: string) => {
    set((state) => {
      const next = new Set(state.enabledLayers);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { enabledLayers: next };
    });
  },
  setLayers: (ids: string[]) => {
    set({ enabledLayers: new Set(ids) });
  },
  isLayerEnabled: (id: string) => {
    return get().enabledLayers.has(id);
  },
}));
