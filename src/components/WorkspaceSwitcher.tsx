/** Floating workspace switcher dropdown */

import { useState } from 'react';
import { WORKSPACES } from '../config/workspaces';
import { useWorkspaceStore } from '../store/workspace';
import { useLayerStore } from '../store/layers';

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const { activeWorkspace, setWorkspace } = useWorkspaceStore();
  const setLayers = useLayerStore((s) => s.setLayers);

  const handleSelect = (id: string) => {
    const ws = WORKSPACES.find((w) => w.id === id);
    if (ws) {
      setWorkspace(id);
      setLayers(ws.enabledLayers);
    }
    setOpen(false);
  };

  return (
    <div className="workspace-switcher">
      {open && (
        <div className="workspace-switcher__dropdown">
          {WORKSPACES.map((ws) => (
            <div
              key={ws.id}
              className={`workspace-switcher__item ${ws.id === activeWorkspace.id ? 'workspace-switcher__item--active' : ''}`}
              onClick={() => handleSelect(ws.id)}
            >
              <span className="workspace-switcher__icon">{ws.icon}</span>
              <div className="workspace-switcher__info">
                <div className="workspace-switcher__name">{ws.name}</div>
                <div className="workspace-switcher__desc">{ws.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        className="workspace-switcher__btn"
        onClick={() => setOpen(!open)}
      >
        {activeWorkspace.icon} Choose Workspace
      </button>
    </div>
  );
}
