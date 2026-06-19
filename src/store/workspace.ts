/** Zustand store for workspace state */

import { create } from 'zustand';
import { WORKSPACES, type WorkspacePreset } from '../config/workspaces';

interface WorkspaceState {
  activeWorkspace: WorkspacePreset;
  selectedCountryCode: string | null;
  selectedCountryName: string | null;
  setWorkspace: (id: string) => void;
  setSelectedCountry: (code: string | null, name: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspace: WORKSPACES[0],
  selectedCountryCode: null,
  selectedCountryName: null,
  setWorkspace: (id: string) => {
    const ws = WORKSPACES.find((w) => w.id === id) || WORKSPACES[0];
    set({ activeWorkspace: ws });
  },
  setSelectedCountry: (code, name) => set({ selectedCountryCode: code, selectedCountryName: name }),
}));
