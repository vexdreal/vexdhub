"use client";

type KeyItem = {
  id: number;
  key: string;
  active: boolean;
  expiresAt: string | null;
  deviceId: string | null;
  lastUsed: string | null;
  useCount: number;
  createdAt: string;
};

type Props = {
  keys: KeyItem[];
  onDetail: (license: KeyItem) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  onReset: (id: number) => void;
  onNotify?: (message: string) => void;
};

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak valid";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function KeyTable({
  keys,
  onDetail,
  onDelete,
  onToggle,
  onReset,
  onNotify,
}: Props) {
  async function copyText(
    text: string,
    label: string
  ) {
    try {
      await navigator.clipboard.writeText(text);
      onNotify?.(`${label} berhasil disalin`);
    } catch {
      onNotify?.(`Gagal menyalin ${label}`);
    }
  }

  function confirmDelete(
    id: number,
    key: string
  ) {
    const confirmed = window.confirm(
      `Hapus license ${key} secara permanen?`
    );

    if (confirmed) {
      onDelete(id);
    }
  }

  function confirmReset(
    id: number,
    key: string
  ) {
    const confirmed = window.confirm(
      `Reset device untuk ${key}?`
    );

    if (confirmed) {
      onReset(id);
    }
  }

  if (keys.length === 0) {
    return (
      <section className="panel license-panel">
        <div className="empty-state">
          <span>◇</span>
          <h3>Tidak ada license</h3>
          <p>
            Ubah filter atau generate license baru.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="license-grid">
      {keys.map((item) => {
        const expired = Boolean(
          item.expiresAt &&
            new Date(item.expiresAt).getTime() <
              Date.now()
        );

        const status = !item.active
          ? "Nonaktif"
          : expired
            ? "Expired"
            : "Active";

        const statusClass = !item.active
          ? "inactive"
          : expired
            ? "expired"
            : "active";

        return (
          <article
            className="license-card"
            key={item.id}
          >
            <div className="license-card-header">
              <div>
                <p className="eyebrow">
                  LICENSE KEY
                </p>

                <h3>{item.key}</h3>
              </div>

              <span
                className={`status-badge ${statusClass}`}
              >
                <span className="status-dot" />
                {status}
              </span>
            </div>

            <div className="license-meta-grid">
              <div className="meta-box wide">
                <span>Device</span>

                <strong
                  title={item.deviceId ?? ""}
                >
                  {item.deviceId ??
                    "Belum digunakan"}
                </strong>
              </div>

              <div className="meta-box">
                <span>Dipakai</span>
                <strong>
                  {item.useCount ?? 0} kali
                </strong>
              </div>

              <div className="meta-box">
                <span>
                  Terakhir digunakan
                </span>

                <strong>
                  {item.lastUsed
                    ? formatDate(item.lastUsed)
                    : "Belum pernah"}
                </strong>
              </div>

              <div className="meta-box">
                <span>Expired</span>

                <strong>
                  {item.expiresAt
                    ? formatDate(
                        item.expiresAt
                      )
                    : "Permanen"}
                </strong>
              </div>
            </div>

            <div className="license-actions">
              <button
                type="button"
                className="button-primary"
                onClick={() => onDetail(item)}
              >
                Lihat Detail
              </button>

              <button
                type="button"
                className="button-secondary"
                onClick={() =>
                  void copyText(
                    item.key,
                    "License key"
                  )
                }
              >
                Copy Key
              </button>

              <button
                type="button"
                className="button-secondary"
                disabled={!item.deviceId}
                onClick={() => {
                  if (item.deviceId) {
                    void copyText(
                      item.deviceId,
                      "Device ID"
                    );
                  }
                }}
              >
                Copy Device
              </button>

              <button
                type="button"
                className="button-ghost"
                onClick={() =>
                  onToggle(item.id)
                }
              >
                {item.active
                  ? "Nonaktifkan"
                  : "Aktifkan"}
              </button>

              <button
                type="button"
                className="button-ghost"
                disabled={!item.deviceId}
                onClick={() =>
                  confirmReset(
                    item.id,
                    item.key
                  )
                }
              >
                Reset Device
              </button>

              <button
                type="button"
                className="button-danger"
                onClick={() =>
                  confirmDelete(
                    item.id,
                    item.key
                  )
                }
              >
                Hapus License
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}