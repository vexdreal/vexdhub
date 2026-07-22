"use client";

type Props = {
  activeSection: string;
  onSelect: (section: string) => void;
  onLogout: () => void;
};

const items = [
  { id: "overview", icon: "▦", label: "Overview" },
  { id: "licenses", icon: "◇", label: "Licenses" },
  { id: "activity", icon: "↻", label: "Activity" },
  { id: "settings", icon: "⚙", label: "Appearance" },
];

export default function Sidebar({
  activeSection,
  onSelect,
  onLogout,
}: Props) {
  return (
    <aside className="app-sidebar">
      <button
        type="button"
        className="sidebar-brand"
        onClick={() => onSelect("overview")}
        aria-label="Buka overview"
      >
        <img
          src="/branding/logo.png"
          alt="Logo VexdHub"
          className="sidebar-brand-logo"
        />

        <div className="sidebar-brand-copy">
          <strong>
            <span>VEXD</span>
            <span>HUB</span>
          </strong>

          <small>Smart License System</small>
        </div>
      </button>

      <nav
        className="sidebar-nav"
        aria-label="Admin navigation"
      >
        <p className="sidebar-label">Workspace</p>

        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`sidebar-link ${
              activeSection === item.id
                ? "is-active"
                : ""
            }`}
            onClick={() => onSelect(item.id)}
          >
            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="server-pill">
          <span className="status-dot" />

          <div>
            <strong>System Online</strong>
            <span>Neon PostgreSQL</span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={onLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}