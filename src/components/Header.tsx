type Props = {
  loading: boolean;
  onRefresh: () => void;
};

export default function Header({ loading, onRefresh }: Props) {
  const now = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">VexdHub Control Center</span>
        <h1>License Overview</h1>
        <p>Manage activation, device binding, expiry, and usage from one place.</p>
      </div>

      <div className="topbar-actions">
        <div className="server-pill">
          <span className="status-dot" />
          <div>
            <strong>System online</strong>
            <small>{now}</small>
          </div>
        </div>
        <button className="button-secondary" type="button" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh data"}
        </button>
      </div>
    </header>
  );
}
