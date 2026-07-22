type ActivityItem = {
  title: string;
  detail: string;
  time: string;
  tone: "success" | "info" | "warning";
};

type Props = {
  items: ActivityItem[];
};

export default function ActivityPanel({ items }: Props) {
  return (
    <section className="panel activity-panel" id="activity">
      <div className="section-heading">
        <div>
          <p className="eyebrow">LIVE FEED</p>
          <h2>Recent Activity</h2>
        </div>
        <span className="count-badge">{items.length} events</span>
      </div>

      <div className="activity-list">
        {items.length === 0 ? (
          <div className="empty-state compact">
            <span>◎</span>
            <p>Belum ada aktivitas di sesi ini.</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div className="activity-item" key={`${item.time}-${index}`}>
              <span className={`activity-dot ${item.tone}`} />
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
              <time>{item.time}</time>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
