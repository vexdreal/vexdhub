"use client";

type KeyItem = {
  id: number;
  key: string;
  active: boolean;
  expiresAt: string | null;
  deviceId: string | null;
  lastUsed: string | null;
  useCount: number;
  createdAt?: string;
};

type Props = {
  keys: KeyItem[];
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  onReset: (id: number) => void;
  onMessage?: (message: string) => void;
};

export default function KeyTable({
  keys,
  onDelete,
  onToggle,
  onReset,
  onMessage,
}: Props) {
  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      onMessage?.(`${label} copied to clipboard`);
    } catch {
      onMessage?.(`Failed to copy ${label.toLowerCase()}`);
    }
  }

  function confirmDelete(id: number, key: string) {
    if (window.confirm(`Delete ${key} permanently? This action cannot be undone.`)) {
      onDelete(id);
    }
  }

  function confirmReset(id: number, key: string) {
    if (window.confirm(`Reset the bound device for ${key}?`)) {
      onReset(id);
    }
  }

  function formatDate(value: string | null, empty: string) {
    if (!value) return empty;
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  if (keys.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⌁</div>
        <h3>No licenses found</h3>
        <p>Try another filter or generate a new license.</p>
      </div>
    );
  }

  return (
    <div className="license-grid">
      {keys.map((item) => {
        const expired = Boolean(
          item.expiresAt && new Date(item.expiresAt).getTime() < Date.now()
        );
        const status = !item.active ? "Disabled" : expired ? "Expired" : "Active";
        const statusClass = !item.active ? "disabled" : expired ? "expired" : "active";

        return (
          <article className="license-card" key={item.id}>
            <div className="license-card-head">
              <div>
                <span className="eyebrow">License key</span>
                <button
                  type="button"
                  className="license-key"
                  title="Copy license key"
                  onClick={() => void copyText(item.key, "License key")}
                >
                  {item.key}
                </button>
              </div>
              <span className={`status-badge ${statusClass}`}>
                <span /> {status}
              </span>
            </div>

            <div className="license-meta-grid">
              <div className="meta-box wide">
                <span>Device binding</span>
                <strong title={item.deviceId ?? "Not bound"}>
                  {item.deviceId ? `${item.deviceId.slice(0, 24)}…` : "Not bound yet"}
                </strong>
              </div>
              <div className="meta-box">
                <span>Usage</span>
                <strong>{item.useCount ?? 0} times</strong>
              </div>
              <div className="meta-box">
                <span>Last used</span>
                <strong>{formatDate(item.lastUsed, "Never")}</strong>
              </div>
              <div className="meta-box wide">
                <span>Expires</span>
                <strong>{formatDate(item.expiresAt, "Permanent")}</strong>
              </div>
            </div>

            <div className="license-actions">
              <button type="button" className="button-secondary" onClick={() => void copyText(item.key, "License key")}>Copy key</button>
              <button
                type="button"
                className="button-secondary"
                disabled={!item.deviceId}
                onClick={() => item.deviceId && void copyText(item.deviceId, "Device ID")}
              >
                Copy device
              </button>
              <button type="button" className="button-secondary" onClick={() => onToggle(item.id)}>
                {item.active ? "Disable" : "Enable"}
              </button>
              <button type="button" className="button-secondary" disabled={!item.deviceId} onClick={() => confirmReset(item.id, item.key)}>
                Reset device
              </button>
              <button type="button" className="button-danger" onClick={() => confirmDelete(item.id, item.key)}>
                Delete license
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
