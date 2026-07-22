"use client";

import { useEffect, useState } from "react";

type Theme =
  | "default"
  | "purple"
  | "blue-ice"
  | "crimson"
  | "emerald"
  | "gold";

const themes: Array<{
  value: Theme;
  label: string;
}> = [
  { value: "default", label: "Default Blue" },
  { value: "purple", label: "Purple Neon" },
  { value: "blue-ice", label: "Blue Ice" },
  { value: "crimson", label: "Crimson" },
  { value: "emerald", label: "Emerald" },
  { value: "gold", label: "Gold" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] =
    useState<Theme>("default");

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem(
        "vexdhub_theme"
      ) as Theme | null) ?? "default";

    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  function applyTheme(selectedTheme: Theme) {
    if (selectedTheme === "default") {
      document.documentElement.removeAttribute(
        "data-theme"
      );
    } else {
      document.documentElement.setAttribute(
        "data-theme",
        selectedTheme
      );
    }
  }

  function changeTheme(selectedTheme: Theme) {
    setTheme(selectedTheme);
    localStorage.setItem(
      "vexdhub_theme",
      selectedTheme
    );
    applyTheme(selectedTheme);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          color: "var(--muted)",
          fontSize: "14px",
        }}
      >
        Tema:
      </span>

      <select
        value={theme}
        onChange={(event) =>
          changeTheme(
            event.target.value as Theme
          )
        }
        style={{
          width: "auto",
          minWidth: "170px",
          margin: 0,
        }}
      >
        {themes.map((item) => (
          <option
            key={item.value}
            value={item.value}
          >
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}