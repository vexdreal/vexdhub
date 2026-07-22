"use client";

import ThemeSwitcher from "@/components/ThemeSwitcher";

type Props = {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
};

const items = [
  { id: "overview", label: "Overview", icon: "◈" },
  { id: "licenses", label: "Licenses", icon: "⌁" },
  { id: "generate", label: "Generate", icon: "+" },
  { id: "settings", label: "Appearance", icon: "✦" },
];

export default function Sidebar({
  activeSection,
  onSectionChange,
  onLogout,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">V</div>
        <div>
          <strong>VexdHub</strong>
          <span>License Console</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Admin navigation">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-link ${activeSection === item.id ? "is-active" : ""}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-theme">
          <span className="eyebrow">Theme</span>
          <ThemeSwitcher compact />
        </div>

        <div className="admin-chip">
          <div className="admin-avatar">VR</div>
          <div>
            <strong>vexdreal</strong>
            <span>Owner</span>
          </div>
        </div>

        <button type="button" className="sidebar-logout" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
