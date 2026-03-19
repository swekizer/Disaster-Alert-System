export default function LoadingSpinner({ text = 'Loading data…' }) {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <span className="loading-text">{text}</span>
    </div>
  );
}
