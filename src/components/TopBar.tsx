/** Top bar — clock, status, workspace label, links */

import { useClock } from '../hooks/useClock';

interface TopBarProps {
  workspaceName: string;
}

export function TopBar({ workspaceName }: TopBarProps) {
  const clock = useClock();

  return (
    <div className="topbar">
      <div className="topbar__brand">
        <div className="topbar__brand-icon">D</div>
        Dashboard
      </div>

      <div className="topbar__separator" />

      <div className="topbar__clock">{clock}</div>

      <div className="topbar__separator" />

      <div className="topbar__live">
        <div className="topbar__live-dot" />
        LIVE
      </div>

      <div className="topbar__separator" />

      <div className="topbar__workspace-name">{workspaceName}</div>

      <div className="topbar__spacer" />

      <div className="topbar__links">
        <a
          className="topbar__link"
          href="https://github.com/mjb199523/Live_dashboard.git"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
        >
          ⬡
        </a>
      </div>
    </div>
  );
}
