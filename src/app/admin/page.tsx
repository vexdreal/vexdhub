"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import ActivityPanel from "@/components/ActivityPanel";
import BatchGenerateCard from "@/components/BatchGenerateCard";
import DashboardStats from "@/components/DashboardStats";
import GenerateCard from "@/components/GenerateCard";
import KeyTable from "@/components/KeyTable";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

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

type StatusFilter = "all" | "active" | "inactive" | "expired" | "bound" | "unbound";

type ActivityItem = {
  title: string;
  detail: string;
  time: string;
  tone: "success" | "info" | "warning";
};

const ITEMS_PER_PAGE = 10;

export default function Admin() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [keys, setKeys] = useState<KeyType[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [duration, setDuration] = useState("30");
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSection, setActiveSection] = useState("overview");
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const addActivity = useCallback((title: string, detail: string, tone: ActivityItem["tone"] = "info") => {
    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    setActivities((current) => [{ title, detail, time, tone }, ...current].slice(0, 8));
  }, []);

  const notify = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage((current) => (current === text ? "" : current)), 3500);
  }, []);

  const loadKeys = useCallback(async () => {
    try {
      setLoadingKeys(true);
      const response = await fetch("/api/keys", { cache: "no-store" });
      if (!response.ok) throw new Error("Gagal mengambil daftar license");
      const data: KeyType[] = await response.json();
      setKeys(data);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Gagal memuat license");
    } finally {
      setLoadingKeys(false);
    }
  }, [notify]);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/admin-check", { cache: "no-store" });
      const data = await response.json();
      if (data.success) {
        setLoggedIn(true);
        await loadKeys();
      }
    } catch {
      notify("Gagal memeriksa sesi admin");
    } finally {
      setChecking(false);
    }
  }, [loadKeys, notify]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  async function login() {
    try {
      notify("Memeriksa password...");
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!data.success) {
        notify(data.message ?? "Password salah");
        return;
      }
      setLoggedIn(true);
      notify("Login berhasil");
      addActivity("Admin login", "Sesi owner berhasil dibuka", "success");
      await loadKeys();
    } catch {
      notify("Login gagal. Coba lagi.");
    }
  }

  async function logout() {
    await fetch("/api/admin-logout", { method: "POST" });
    setLoggedIn(false);
    setPassword("");
    setKeys([]);
    setActivities([]);
    setMessage("");
  }

  async function generateKey() {
    try {
      setGenerating(true);
      const random = crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
      const key = `VEXD-${random}`;
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, duration }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        notify(data.message ?? "Gagal membuat license");
        return;
      }
      notify(`License berhasil dibuat: ${key}`);
      addActivity("License generated", key, "success");
      setCurrentPage(1);
      await loadKeys();
    } catch {
      notify("Terjadi kesalahan saat membuat license");
    } finally {
      setGenerating(false);
    }
  }

  async function deleteKey(id: number) {
    try {
      const target = keys.find((item) => item.id === id);
      const response = await fetch("/api/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        notify(data.message ?? "Gagal menghapus license");
        return;
      }
      notify("License berhasil dihapus");
      addActivity("License deleted", target?.key ?? `ID ${id}`, "warning");
      await loadKeys();
    } catch {
      notify("Gagal menghapus license");
    }
  }

  async function resetDevice(id: number) {
    try {
      const target = keys.find((item) => item.id === id);
      const response = await fetch("/api/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, resetDevice: true }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        notify(data.message ?? "Gagal mereset device");
        return;
      }
      notify("Device berhasil direset");
      addActivity("Device reset", target?.key ?? `ID ${id}`, "info");
      await loadKeys();
    } catch {
      notify("Gagal mereset device");
    }
  }

  async function toggleKey(id: number) {
    try {
      const target = keys.find((item) => item.id === id);
      const response = await fetch("/api/toggle-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        notify(data.message ?? "Gagal mengubah status license");
        return;
      }
      notify("Status license berhasil diubah");
      addActivity("Status changed", target?.key ?? `ID ${id}`, "info");
      await loadKeys();
    } catch {
      notify("Gagal mengubah status license");
    }
  }

  const filteredKeys = useMemo(() => {
    const now = Date.now();
    const keyword = search.trim().toLowerCase();

    return keys.filter((item) => {
      const expired = Boolean(item.expiresAt && new Date(item.expiresAt).getTime() < now);
      const matchesSearch = item.key.toLowerCase().includes(keyword) || (item.deviceId ?? "").toLowerCase().includes(keyword);
      const statusMatches =
        statusFilter === "all" ||
        (statusFilter === "active" && item.active && !expired) ||
        (statusFilter === "inactive" && !item.active) ||
        (statusFilter === "expired" && expired) ||
        (statusFilter === "bound" && Boolean(item.deviceId)) ||
        (statusFilter === "unbound" && !item.deviceId);
      return matchesSearch && statusMatches;
    });
  }, [keys, search, statusFilter]);

  useEffect(() => setCurrentPage(1), [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredKeys.length / ITEMS_PER_PAGE));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedKeys = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredKeys.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredKeys, currentPage]);

  function exportCSV() {
    if (filteredKeys.length === 0) {
      notify("Tidak ada data untuk diekspor");
      return;
    }

    const escapeCSV = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = filteredKeys.map((item) => [
      item.id,
      item.key,
      item.active ? "Active" : "Nonaktif",
      item.deviceId ?? "Belum digunakan",
      item.useCount ?? 0,
      item.lastUsed ? new Date(item.lastUsed).toLocaleString("id-ID") : "Belum pernah",
      item.expiresAt ? new Date(item.expiresAt).toLocaleString("id-ID") : "Permanen",
      item.createdAt ? new Date(item.createdAt).toLocaleString("id-ID") : "-",
    ]);

    const csv = [["ID", "Key", "Status", "Device", "Jumlah Pakai", "Terakhir Digunakan", "Expired", "Dibuat"], ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vexdhub-keys-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify("CSV berhasil diekspor");
    addActivity("CSV exported", `${filteredKeys.length} license`, "info");
  }

  const expiredCount = keys.filter((item) => item.expiresAt && new Date(item.expiresAt).getTime() < Date.now()).length;
  const activeCount = keys.filter((item) => item.active && !(item.expiresAt && new Date(item.expiresAt).getTime() < Date.now())).length;
  const deviceCount = keys.filter((item) => item.deviceId).length;

  function navigateTo(section: string) {
    setActiveSection(section);
    const element = document.getElementById(section);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (checking) {
    return (
      <main className="center-screen">
        <div className="loading-orb" />
        <p>Memeriksa sesi admin...</p>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <div className="auth-logo">V</div>
          <p className="eyebrow">VEXDHUB CLOUD</p>
          <h1>Welcome back</h1>
          <p className="auth-copy">Masuk ke admin console untuk mengelola seluruh license.</p>
          <label className="field-label" htmlFor="admin-password">Admin Password</label>
          <input
            id="admin-password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && void login()}
          />
          <button type="button" className="button-primary full-width" onClick={() => void login()}>Login to Console</button>
          {message && <p className="auth-message">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <Sidebar activeSection={activeSection} onSelect={navigateTo} onLogout={() => void logout()} />

      <div className="app-main">
        <Topbar loading={loadingKeys} onRefresh={() => void loadKeys()} />

        {message && <div className="toast-message"><span>✓</span>{message}</div>}

        <section id="overview" className="dashboard-section">
          <DashboardStats total={keys.length} active={activeCount} expired={expiredCount} devices={deviceCount} />

          <div className="dashboard-grid">
            <GenerateCard duration={duration} setDuration={setDuration} generateKey={() => void generateKey()} loading={generating} />
            <BatchGenerateCard
              onSuccess={loadKeys}
              onMessage={notify}
              onActivity={(title, detail) => addActivity(title, detail, "success")}
            />
          </div>
        </section>

        <section id="licenses" className="dashboard-section">
          <div className="section-heading license-heading">
            <div>
              <p className="eyebrow">MANAGEMENT</p>
              <h2>License Manager</h2>
              <p className="section-copy">Cari, filter, ekspor, dan kelola seluruh license.</p>
            </div>
            <span className="count-badge">{filteredKeys.length} hasil</span>
          </div>

          <div className="toolbar panel">
            <SearchBar value={search} onChange={setSearch} />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
              <option value="all">Semua Status</option>
              <option value="active">Active</option>
              <option value="inactive">Nonaktif</option>
              <option value="expired">Expired</option>
              <option value="bound">Device Terikat</option>
              <option value="unbound">Belum Terikat</option>
            </select>
            <button type="button" className="button-secondary" onClick={exportCSV}>Export CSV</button>
            <button type="button" className="button-ghost" onClick={() => void loadKeys()} disabled={loadingKeys}>Refresh Data</button>
          </div>

          <KeyTable keys={paginatedKeys} onDelete={deleteKey} onToggle={toggleKey} onReset={resetDevice} onNotify={notify} />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </section>

        <ActivityPanel items={activities} />

        <section id="settings" className="panel settings-panel">
          <div>
            <p className="eyebrow">APPEARANCE</p>
            <h2>Theme Settings</h2>
            <p className="section-copy">Gunakan pemilih tema di kanan atas. Pilihan tersimpan otomatis di browser.</p>
          </div>
          <div className="theme-preview-row">
            {[
              ["Default", "#4da3ff"],
              ["Purple", "#a855f7"],
              ["Blue Ice", "#38bdf8"],
              ["Crimson", "#ef4444"],
              ["Emerald", "#34d399"],
              ["Gold", "#fbbf24"],
            ].map(([label, color]) => (
              <div className="theme-preview" key={label}><span style={{ background: color }} />{label}</div>
            ))}
          </div>
        </section>

        <footer className="app-footer">
          <span>VexdHub V5</span>
          <span>Neon Connected</span>
          <span>© 2026 VexdReal</span>
        </footer>
      </div>
    </main>
  );
}
