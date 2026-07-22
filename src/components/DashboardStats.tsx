type Props = {
  total: number;
  active: number;
  expired: number;
  devices: number;
  today: number;
  activation: number;
};

const cards = [
  {
    key: "total",
    label: "Total License",
    icon: "◇",
    tone: "blue",
    caption: "Semua license",
  },

  {
    key: "active",
    label: "Active License",
    icon: "●",
    tone: "green",
    caption: "License aktif",
  },

  {
    key: "expired",
    label: "Expired",
    icon: "◷",
    tone: "orange",
    caption: "Sudah expired",
  },

  {
    key: "devices",
    label: "Device Locked",
    icon: "▣",
    tone: "purple",
    caption: "Device terikat",
  },

  {
    key: "today",
    label: "Generated Today",
    icon: "✚",
    tone: "blue",
    caption: "Hari ini",
  },

  {
    key: "activation",
    label: "Total Activation",
    icon: "⚡",
    tone: "green",
    caption: "Semua aktivasi",
  },
] as const;

export default function DashboardStats({
  total,
  active,
  expired,
  devices,
  today,
  activation,
}: Props) {
  const values = {
    total,
    active,
    expired,
    devices,
    today,
    activation,
  };

  const activeRate =
    total > 0
      ? Math.round((active / total) * 100)
      : 0;

  return (
    <section
      className="stats-grid"
      aria-label="Dashboard Statistics"
    >
      {cards.map((card) => (
        <article
          key={card.key}
          className={`stat-card tone-${card.tone}`}
        >
          <div className="stat-card-top">
            <span className="stat-icon">
              {card.icon}
            </span>

            <span className="stat-trend">
              {card.key === "active"
                ? `${activeRate}%`
                : "LIVE"}
            </span>
          </div>

          <p>{card.label}</p>

          <strong>
            {
              values[
                card.key as keyof typeof values
              ]
            }
          </strong>

          <span className="stat-caption">
            {card.caption}
          </span>
        </article>
      ))}
    </section>
  );
}