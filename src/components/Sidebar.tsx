"use client";

type Props = {
  activeSection: string;
  onSelect: (section: string) => void;
  onLogout: () => void;
};

const items = [
  {
    id: "overview",
    icon: "▦",
    label: "Overview",
  },
  {
    id: "licenses",
    icon: "◇",
    label: "Licenses",
  },
  {
    id: "activity",
    icon: "↻",
    label: "Activity",
  },
  {
    id: "settings",
    icon: "⚙",
    label: "Appearance",
  },
];

export default function Sidebar({
  activeSection,
  onSelect,
  onLogout,
}: Props) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <img
          src="/branding/logo.png"
          alt="VexdHub Logo"
          className="sidebar-brand-logo"
        />

        <div className="sidebar-brand-text">
          <strong>VEXDHUB</strong>
          <span>Smart License System</span>
        </div>
      </div>

      <nav
        className="sidebar-nav"
        aria-label="Admin navigation"
      >
        <p className="sidebar-label">
          Workspace
        </p>

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