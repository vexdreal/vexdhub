"use client";

import { useState } from "react";

export default function Dashboard() {
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");

  async function verifyKey() {
    const res = await fetch("/api/verify-key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
      }),
    });

    const data = await res.json();

    setMessage(data.message);
  }

  return (
    <main>
      <div className="login-card">
        <h1>VexdHub Dashboard</h1>

        <p>Activate your license key</p>

        <input
          type="text"
          placeholder="Masukkan Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />

        <button onClick={verifyKey}>
          Activate Key
        </button>

        <p>{message}</p>
      </div>
    </main>
  );
}