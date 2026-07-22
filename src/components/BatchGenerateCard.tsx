"use client";

import { useState } from "react";

type Props = {
  onSuccess: () => Promise<void> | void;
  onMessage: (message: string) => void;
};

export default function BatchGenerateCard({
  onSuccess,
  onMessage,
}: Props) {
  const [amount, setAmount] = useState("10");
  const [duration, setDuration] = useState("30");
  const [loading, setLoading] = useState(false);

  async function generateBatch() {
    try {
      setLoading(true);
      onMessage("Sedang membuat key...");

      const response = await fetch(
        "/api/keys/batch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Number(amount),
            duration: Number(duration),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        onMessage(
          data.message ?? "Gagal membuat key"
        );
        return;
      }

      onMessage(data.message);
      await onSuccess();
    } catch {
      onMessage(
        "Terjadi kesalahan saat membuat key"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        marginBottom: "22px",
        padding: "18px",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        background: "var(--surface-soft)",
      }}
    >
      <h2 style={{ marginBottom: "14px" }}>
        Batch Generate
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          alignItems: "end",
        }}
      >
        <label>
          <span>Jumlah Key</span>

          <select
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
          >
            <option value="5">5 Key</option>
            <option value="10">10 Key</option>
            <option value="25">25 Key</option>
            <option value="50">50 Key</option>
            <option value="100">100 Key</option>
          </select>
        </label>

        <label>
          <span>Durasi</span>

          <select
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
        </label>

        <button
          type="button"
          disabled={loading}
          onClick={() => void generateBatch()}
        >
          {loading
            ? "Membuat..."
            : "Generate Batch"}
        </button>
      </div>
    </section>
  );
}