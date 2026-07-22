"use client";

import { useEffect, useState } from "react";

type Theme = "default" | "purple" | "blue-ice" | "crimson" | "emerald" | "gold";

type Props = { compact?: boolean };

const themes: Array<{ value: Theme; label: string }> = [
  { value: "default", label: "Default Blue" },
  { value: "purple", label: "Purple Neon" },
  { value: "blue-ice", label: "Blue Ice" },
  { value: "crimson", label: "Crimson" },
  { value: "emerald", label: "Emerald" },
  { value: "gold", label: "Gold" },
];

export default function ThemeSwitcher({ compact = false }: Props) {
  const [theme, setTheme] = useState<Theme>("default");

  useEffect(() => {
    const saved = (localStorage.getItem("vexdhub_theme") as Theme | null) ?? "default";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  function applyTheme(selected: Theme) {
    if (selected === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", selected);
    }
  }

  function changeTheme(selected: Theme) {
    setTheme(selected);
    localStorage.setItem("vexdhub_theme", selected);
    applyTheme(selected);
  }

  return (
    <select
      aria-label="Theme"
      className={compact ? "theme-select compact" : "theme-select"}
      value={theme}
      onChange={(event) => changeTheme(event.target.value as Theme)}
    >
      {themes.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
