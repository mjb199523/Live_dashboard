/** Formatting utilities */

export function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.max(0, now - then);

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatNumber(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#ff4444';
    case 'high': return '#ff8c00';
    case 'medium': return '#ffd700';
    case 'low': return '#00ff88';
    default: return '#6b7a8d';
  }
}

export function ciiColor(score: number): string {
  if (score >= 75) return '#ff4444';
  if (score >= 50) return '#ff8c00';
  if (score >= 25) return '#ffd700';
  return '#00ff88';
}

export function ciiLabel(score: number): string {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'ELEVATED';
  return 'STABLE';
}

export function trendArrow(trend: string): string {
  switch (trend) {
    case 'improving':
    case 'up': return '▲';
    case 'worsening':
    case 'down': return '▼';
    default: return '—';
  }
}
