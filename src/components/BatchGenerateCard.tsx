"use client";

import { useState } from "react";

type Props = {
  onSuccess: () => Promise<void> | void;
  onMessage: (message: string) => void;
};

export default function BatchGenerateCard({ onSuccess, onMessage }: Props) {
  const [amount, setAmount] = useState("10");
  const [duration, setDuration] = useState("30");
  const [loading, setLoading] = useState(false);

  async function generateBatch() {
    try {
      setLoading(true);
      onMessage("Generating batch licenses...");

      const response = await fetch("/api/keys/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), duration: Number(duration) }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        onMessage(data.message ?? "Failed to generate licenses");
        return;
      }

      onMessage(data.message);
      await onSuccess();
    } catch {
      onMessage("Failed to generate licenses");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel-card batch-card">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Bulk tool</span>
          <h2>Batch generate</h2>
          <p>Create up to 100 licenses in one operation.</p>
        </div>
        <div className="panel-icon">≋</div>
      </div>

      <div className="batch-controls">
        <label>
          <span>Amount</span>
          <select value={amount} onChange={(event) => setAmount(event.target.value)}>
            <option value="5">5 Keys</option>
            <option value="10">10 Keys</option>
            <option value="25">25 Keys</option>
            <option value="50">50 Keys</option>
            <option value="100">100 Keys</option>
          </select>
        </label>
        <label>
          <span>Validity</span>
          <select value={duration} onChange={(event) => setDuration(event.target.value)}>
            <option value="1">1 Day</option>
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
            <option value="0">Permanent</option>
          </select>
        </label>
        <button type="button" disabled={loading} onClick={() => void generateBatch()}>
          {loading ? "Generating..." : "Generate batch"}
        </button>
      </div>
    </section>
  );
}
