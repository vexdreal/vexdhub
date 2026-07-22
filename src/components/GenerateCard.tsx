"use client";

type Props = {
  duration: string;
  setDuration: (value: string) => void;
  generateKey: () => void;
  loading?: boolean;
  generatedKey?: string;
};

export default function GenerateCard({
  duration,
  setDuration,
  generateKey,
  loading = false,
  generatedKey = "",
}: Props) {
  async function copyGeneratedKey() {
    if (!generatedKey) return;

    await navigator.clipboard.writeText(generatedKey);
    alert("Key berhasil disalin");
  }

  return (
    <section className="panel generate-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">QUICK ACTION</p>
          <h2>Generate License</h2>
        </div>

        <span className="panel-icon">＋</span>
      </div>

      <p className="panel-description">
        Buat satu license baru dengan durasi yang dipilih.
      </p>

      <label
        className="field-label"
        htmlFor="single-duration"
      >
        Durasi License
      </label>

      <select
        id="single-duration"
        value={duration}
        onChange={(event) =>
          setDuration(event.target.value)
        }
      >
        <option value="1">1 Hari</option>
        <option value="7">7 Hari</option>
        <option value="30">30 Hari</option>
        <option value="90">90 Hari</option>
        <option value="0">Permanen</option>
      </select>

      <button
        type="button"
        className="button-primary full-width"
        onClick={generateKey}
        disabled={loading}
      >
        {loading
          ? "Membuat License..."
          : "Generate New Key"}
      </button>

      {generatedKey && (
        <div
          style={{
            marginTop: "16px",
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <p
            style={{
              marginBottom: "7px",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            Key terbaru
          </p>

          <strong
            style={{
              display: "block",
              marginBottom: "12px",
              wordBreak: "break-all",
              fontSize: "16px",
            }}
          >
            {generatedKey}
          </strong>

          <button
            type="button"
            className="button-secondary full-width"
            onClick={() => void copyGeneratedKey()}
          >
            Copy Key
          </button>
        </div>
      )}
    </section>
  );
}