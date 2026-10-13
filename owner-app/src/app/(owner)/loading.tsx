export default function Loading() {
  return (
    <div className="loading-content" aria-busy="true" aria-label="Loading your workspace">
      <span className="sr-only" role="status">Loading your workspace…</span>
      <div className="skeleton skeleton-eyebrow" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-subtitle" />
      <div className="skeleton skeleton-stats" />
      <div className="skeleton skeleton-toolbar" />
      {[0, 1, 2, 3, 4].map((row) => <div key={row} className="skeleton skeleton-row" />)}
    </div>
  );
}
