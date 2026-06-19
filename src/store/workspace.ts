/** Zustand store for workspace state */

import { create } from 'zustand';
import { WORKSPACES, type WorkspacePreset } from '../config/workspaces';

interface WorkspaceState {
  activeWorkspace: WorkspacePreset;
  setWorkspace: (id: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspace: WORKSPACES[0],
  setWorkspace: (id: string) => {
    const ws = WORKSPACES.find((w) => w.id === id) || WORKSPACES[0];
    set({ activeWorkspace: ws });
  },
}));
