"use client";

type KeyType = {
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
  license: KeyType | null;
  onClose: () => void;
  onReset: (id: number) => void;
  onDelete: (id: number) => void;
  onNotify: (message: string) => void;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Permanen";
  }

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LicenseDetailModal({
  license,
  onClose,
  onReset,
  onDelete,
  onNotify,
}: Props) {
  if (!license) {
    return null;
  }
  const currentLicense = license;

  const expired =
    currentLicense.expiresAt !== null &&
    new Date(currentLicense.expiresAt).getTime() < Date.now();

  const status = expired
    ? "Expired"
    : currentLicense.active
      ? "Active"
      : "Nonaktif";

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(currentLicense.key);
      onNotify("Key berhasil disalin");
    } catch {
      onNotify("Gagal menyalin key");
    }
  }

  function confirmReset() {
    const confirmed = window.confirm(
      `Reset device untuk ${currentLicense.key}?`
    );

    if (!confirmed) {
      return;
    }

    onReset(currentLicense.id);
    onClose();
  }

  function confirmDelete() {
    const confirmed = window.confirm(
      `Hapus permanen license ${currentLicense.key}?`
    );

    if (!confirmed) {
      return;
    }

    onDelete(currentLicense.id);
    onClose();
  }

  return (
    <div
      className="license-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="license-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="license-detail-title"
      >
        <div className="license-modal-header">
          <div>
            <p className="eyebrow">
              LICENSE DETAIL
            </p>

            <h2 id="license-detail-title">
              Detail License
            </h2>
          </div>

          <button
            type="button"
            className="license-modal-close"
            onClick={onClose}
            aria-label="Tutup modal"
          >
            ×
          </button>
        </div>

        <div className="license-modal-key">
          <span>License Key</span>
          <strong>{currentLicense.key}</strong>
        </div>

        <div className="license-detail-grid">
          <div>
            <span>Status</span>
            <strong className={`license-status status-${status.toLowerCase()}`}>
              {status}
            </strong>
          </div>

          <div>
            <span>Created</span>
            <strong>{formatDate(currentLicense.createdAt)}</strong>
          </div>

          <div>
            <span>Expired</span>
            <strong>{formatDate(currentLicense.expiresAt)}</strong>
          </div>

          <div>
            <span>Device ID</span>
            <strong>{currentLicense.deviceId ?? "Belum terikat"}</strong>
          </div>

          <div>
            <span>Activation</span>
            <strong>{currentLicense.useCount}</strong>
          </div>

          <div>
            <span>Last Used</span>
            <strong>
              {currentLicense.lastUsed
                ? formatDate(currentLicense.lastUsed)
                : "Belum pernah"}
            </strong>
          </div>
        </div>

        <div className="license-modal-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={() => void copyKey()}
          >
            Copy Key
          </button>

          <button
            type="button"
            className="button-ghost"
            onClick={confirmReset}
            disabled={!currentLicense.deviceId}
          >
            Reset Device
          </button>

          <button
            type="button"
            className="button-danger"
            onClick={confirmDelete}
          >
            Delete License
          </button>
        </div>
      </section>
    </div>
  );
}