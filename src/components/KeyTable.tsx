"use client";

type KeyItem = {
  id: number;
  key: string;
  active: boolean;
  expiresAt: string | null;
  deviceId: string | null;
  lastUsed: string | null;
  useCount: number;
};

type Props = {
  keys: KeyItem[];
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  onReset: (id: number) => void;
};

export default function KeyTable({
  keys,
  onDelete,
  onToggle,
  onReset,
}: Props) {
  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} berhasil disalin`);
    } catch {
      alert(`Gagal menyalin ${label}`);
    }
  }

  function confirmDelete(id: number, key: string) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus key ${key} secara permanen?`
    );

    if (confirmed) {
      onDelete(id);
    }
  }

  function confirmReset(id: number, key: string) {
    const confirmed = window.confirm(
      `Reset device untuk key ${key}?`
    );

    if (confirmed) {
      onReset(id);
    }
  }

  if (keys.length === 0) {
    return (
      <section>
        <h2>Daftar License Key</h2>
        <p>Belum ada key.</p>
      </section>
    );
  }

  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "18px",
        }}
      >
        <h2 style={{ margin: 0 }}>
          Daftar License Key
        </h2>

        <span
          style={{
            color: "#9aa4b2",
            fontSize: "14px",
          }}
        >
          {keys.length} license
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
        }}
      >
        {keys.map((item) => {
          const isExpired =
            item.expiresAt !== null &&
            new Date(item.expiresAt).getTime() < Date.now();

          const statusText = !item.active
            ? "Nonaktif"
            : isExpired
              ? "Expired"
              : "Active";

          const statusColor = !item.active
            ? "#ff6b6b"
            : isExpired
              ? "#ffb84d"
              : "#53e08c";

          return (
            <article
              key={item.id}
              style={{
                padding: "20px",
                borderRadius: "18px",
                border:
                  "1px solid rgba(255,255,255,0.12)",
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))",
                boxShadow:
                  "0 12px 30px rgba(0,0,0,0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "#9aa4b2",
                      fontSize: "13px",
                      marginBottom: "6px",
                    }}
                  >
                    License Key
                  </p>

                  <strong
                    style={{
                      fontSize: "17px",
                      wordBreak: "break-all",
                    }}
                  >
                    {item.key}
                  </strong>
                </div>

                <span
                  style={{
                    color: statusColor,
                    background: `${statusColor}18`,
                    border: `1px solid ${statusColor}55`,
                    borderRadius: "999px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {statusText}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <InfoItem
                  label="Device"
                  value={
                    item.deviceId
                      ? `${item.deviceId.slice(0, 20)}...`
                      : "Belum digunakan"
                  }
                />

                <InfoItem
                  label="Dipakai"
                  value={`${item.useCount ?? 0} kali`}
                />

                <InfoItem
                  label="Terakhir digunakan"
                  value={
                    item.lastUsed
                      ? new Date(item.lastUsed).toLocaleString(
                          "id-ID"
                        )
                      : "Belum pernah"
                  }
                />

                <InfoItem
                  label="Expired"
                  value={
                    item.expiresAt
                      ? new Date(item.expiresAt).toLocaleString(
                          "id-ID"
                        )
                      : "Permanen"
                  }
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() => copyText(item.key, "Key")}
                >
                  Copy Key
                </button>

                {item.deviceId ? (
                  <button
                    onClick={() =>
                      copyText(item.deviceId as string, "Device ID")
                    }
                  >
                    Copy Device
                  </button>
                ) : (
                  <button disabled>
                    Belum Terikat
                  </button>
                )}

                <button
                  onClick={() => onToggle(item.id)}
                >
                  {item.active
                    ? "Nonaktifkan"
                    : "Aktifkan"}
                </button>

                <button
                  onClick={() =>
                    confirmReset(item.id, item.key)
                  }
                >
                  Reset Device
                </button>

                <button
                  onClick={() =>
                    confirmDelete(item.id, item.key)
                  }
                  style={{
                    gridColumn: "1 / -1",
                    background:
                      "linear-gradient(135deg, #ef4444, #b91c1c)",
                  }}
                >
                  Hapus License
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "12px",
        background: "rgba(0,0,0,0.22)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p
        style={{
          color: "#9aa4b2",
          fontSize: "12px",
          marginBottom: "5px",
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: 0,
          fontWeight: 600,
          wordBreak: "break-word",
        }}
      >
        {value}
      </p>
    </div>
  );
}