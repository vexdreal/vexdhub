"use client";

import { useState } from "react";

type Props = {
  onSuccess: () => Promise<void> | void;
  onMessage: (message: string) => void;
  onActivity?: (title: string, detail: string) => void;
};

export default function BatchGenerateCard({ onSuccess, onMessage, onActivity }: Props) {
  const [amount, setAmount] = useState("10");
  const [duration, setDuration] = useState("30");
  const [loading, setLoading] = useState(false);

  async function generateBatch() {
    try {
      setLoading(true);
      onMessage("Sedang membuat batch license...");

      const response = await fetch("/api/keys/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), duration: Number(duration) }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        onMessage(data.message ?? "Gagal membuat batch license");
        return;
      }

      onMessage(data.message);
      onActivity?.("Batch generated", `${data.count ?? amount} license baru dibuat`);
      await onSuccess();
    } catch {
      onMessage("Terjadi kesalahan saat membuat batch license");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel generate-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">BULK TOOLS</p>
          <h2>Batch Generate</h2>
        </div>
        <span className="panel-icon">⧉</span>
      </div>

      <p className="panel-description">Generate hingga 100 key sekaligus untuk distribusi massal.</p>

      <div className="form-grid two-columns">
        <label>
          <span className="field-label">Jumlah</span>
          <select value={amount} onChange={(event) => setAmount(event.target.value)}>
            <option value="5">5 Key</option>
            <option value="10">10 Key</option>
            <option value="25">25 Key</option>
            <option value="50">50 Key</option>
            <option value="100">100 Key</option>
          </select>
        </label>
        <label>
          <span className="field-label">Durasi</span>
          <select value={duration} onChange={(event) => setDuration(event.target.value)}>
            <option value="1">1 Hari</option>
            <option value="7">7 Hari</option>
            <option value="30">30 Hari</option>
            <option value="90">90 Hari</option>
            <option value="0">Permanen</option>
          </select>
        </label>
      </div>

      <button type="button" className="button-secondary full-width" disabled={loading} onClick={() => void generateBatch()}>
        {loading ? "Membuat Batch..." : "Generate Batch Keys"}
      </button>
    </section>
  );
}
