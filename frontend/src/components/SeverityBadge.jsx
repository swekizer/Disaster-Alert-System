const SEVERITY_LABELS = {
  low: 'Low',
  medium: 'Warning',
  high: 'High Alert',
  extreme: 'Extreme',
};

export default function SeverityBadge({ severity }) {
  const s = (severity || 'medium').toLowerCase();
  return (
    <span className={`badge badge-${s}`}>
      {SEVERITY_LABELS[s] || s}
    </span>
  );
}
