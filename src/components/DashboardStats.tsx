type Props = {
  total: number;
  active: number;
  expired: number;
  devices: number;
};

const cards = [
  { key: "total", label: "Total License", icon: "◇", tone: "blue" },
  { key: "active", label: "Active", icon: "●", tone: "green" },
  { key: "expired", label: "Expired", icon: "◷", tone: "orange" },
  { key: "devices", label: "Device Locked", icon: "▣", tone: "purple" },
] as const;

export default function DashboardStats({ total, active, expired, devices }: Props) {
  const values = { total, active, expired, devices };
  const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <section className="stats-grid" aria-label="License statistics">
      {cards.map((card) => (
        <article key={card.key} className={`stat-card tone-${card.tone}`}>
          <div className="stat-card-top">
            <span className="stat-icon">{card.icon}</span>
            <span className="stat-trend">{card.key === "active" ? `${activeRate}%` : "Live"}</span>
          </div>
          <p>{card.label}</p>
          <strong>{values[card.key]}</strong>
          <span className="stat-caption">
            {card.key === "devices" ? "Perangkat terikat" : card.key === "expired" ? "Perlu perhatian" : "Tersinkron otomatis"}
          </span>
        </article>
      ))}
    </section>
  );
}
