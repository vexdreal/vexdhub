"use client";

import ThemeSwitcher from "@/components/ThemeSwitcher";

type Props = {
  loading: boolean;
  onRefresh: () => void;
};

export default function Topbar({ loading, onRefresh }: Props) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">ADMIN CONSOLE</p>
        <h1>License Overview</h1>
        <p className="topbar-copy">Kelola key, perangkat, dan masa aktif dari satu dashboard.</p>
      </div>

      <div className="topbar-actions">
        <ThemeSwitcher />
        <button type="button" className="button-secondary" onClick={onRefresh} disabled={loading}>
          <span className={loading ? "spin" : ""}>↻</span>
          {loading ? "Memuat" : "Refresh"}
        </button>
        <div className="admin-chip">
          <div className="admin-avatar">VR</div>
          <div>
            <strong>vexdreal</strong>
            <span>Owner</span>
          </div>
        </div>
      </div>
    </header>
  );
}
