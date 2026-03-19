export default function StatBar({ stats, nearbyCount }) {
  const total  = stats?.total  ?? '–';
  const byS    = stats?.bySeverity || [];
  const danger = byS.find((s) => s._id === 'extreme' || s._id === 'high');
  const warn   = byS.find((s) => s._id === 'medium');

  return (
    <div className="stat-bar">
      <div className="stat-card info">
        <div className="stat-value">{total}</div>
        <div className="stat-label">Active Events</div>
      </div>

      <div className="stat-card danger">
        <div className="stat-value">{danger?.count ?? 0}</div>
        <div className="stat-label">High / Extreme</div>
      </div>

      <div className="stat-card warning">
        <div className="stat-value">{warn?.count ?? 0}</div>
        <div className="stat-label">Warnings</div>
      </div>

      <div className="stat-card safe">
        <div className="stat-value">{nearbyCount ?? '–'}</div>
        <div className="stat-label">Near You</div>
      </div>
    </div>
  );
}
