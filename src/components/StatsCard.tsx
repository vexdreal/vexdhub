type Props = {
  title: string;
  value: number;
  icon: string;
  helper: string;
  tone?: "primary" | "success" | "warning" | "violet";
};

export default function StatsCard({
  title,
  value,
  icon,
  helper,
  tone = "primary",
}: Props) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-copy">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </article>
  );
}
