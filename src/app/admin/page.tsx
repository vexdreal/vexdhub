"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import BatchGenerateCard from "@/components/BatchGenerateCard";
import GenerateCard from "@/components/GenerateCard";
import Header from "@/components/Header";
import KeyTable from "@/components/KeyTable";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";
import StatsCard from "@/components/StatsCard";

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

type StatusFilter =
  | "all"
  | "active"
  | "inactive"
  | "expired"
  | "bound"
  | "unbound";

const ITEMS_PER_PAGE = 10;

export default function Admin() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loadingKeys, setLoadingKeys] = useState(false);

  const [keys, setKeys] = useState<KeyType[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [duration, setDuration] = useState("30");
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadKeys = useCallback(async () => {
    try {
      setLoadingKeys(true);

      const response = await fetch("/api/keys", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil daftar key");
      }

      const data: KeyType[] = await response.json();
      setKeys(data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal memuat key"
      );
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/admin-check", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setLoggedIn(true);
        await loadKeys();
      }
    } catch {
      setMessage("Gagal memeriksa sesi admin");
    } finally {
      setChecking(false);
    }
  }, [loadKeys]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  async function login() {
    try {
      setMessage("Memeriksa password...");

      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage("Password salah");
        return;
      }

      setLoggedIn(true);
      setMessage("Login berhasil");
      await loadKeys();
    } catch {
      setMessage("Login gagal");
    }
  }

  async function logout() {
    await fetch("/api/admin-logout", {
      method: "POST",
    });

    setLoggedIn(false);
    setPassword("");
    setKeys([]);
    setMessage("");
  }

  async function generateKey() {
    try {
      const random = crypto
        .randomUUID()
        .replaceAll("-", "")
        .slice(0, 10)
        .toUpperCase();

      const key = `VEXD-${random}`;

      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          duration,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message ?? "Gagal membuat key");
        return;
      }

      setMessage(`Key berhasil dibuat: ${key}`);
      setCurrentPage(1);
      await loadKeys();
    } catch {
      setMessage("Terjadi kesalahan saat membuat key");
    }
  }

  async function deleteKey(id: number) {
    try {
      const response = await fetch("/api/keys", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message ?? "Gagal menghapus key");
        return;
      }

      setMessage("Key berhasil dihapus");
      await loadKeys();
    } catch {
      setMessage("Gagal menghapus key");
    }
  }

  async function resetDevice(id: number) {
    try {
      const response = await fetch("/api/keys", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          resetDevice: true,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message ?? "Gagal mereset device");
        return;
      }

      setMessage("Device berhasil direset");
      await loadKeys();
    } catch {
      setMessage("Gagal mereset device");
    }
  }

  async function toggleKey(id: number) {
    try {
      const response = await fetch("/api/toggle-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(
          data.message ?? "Gagal mengubah status key"
        );
        return;
      }

      setMessage("Status key berhasil diubah");
      await loadKeys();
    } catch {
      setMessage("Gagal mengubah status key");
    }
  }

  const filteredKeys = useMemo(() => {
    const now = Date.now();
    const keyword = search.trim().toLowerCase();

    return keys.filter((item) => {
      const expired =
        item.expiresAt !== null &&
        new Date(item.expiresAt).getTime() < now;

      const matchesSearch =
        item.key.toLowerCase().includes(keyword) ||
        (item.deviceId ?? "")
          .toLowerCase()
          .includes(keyword);

      let matchesStatus = true;

      if (statusFilter === "active") {
        matchesStatus = item.active && !expired;
      } else if (statusFilter === "inactive") {
        matchesStatus = !item.active;
      } else if (statusFilter === "expired") {
        matchesStatus = expired;
      } else if (statusFilter === "bound") {
        matchesStatus = Boolean(item.deviceId);
      } else if (statusFilter === "unbound") {
        matchesStatus = !item.deviceId;
      }

      return matchesSearch && matchesStatus;
    });
  }, [keys, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredKeys.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedKeys = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredKeys.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredKeys, currentPage]);

  function exportCSV() {
    if (filteredKeys.length === 0) {
      setMessage("Tidak ada data untuk diekspor");
      return;
    }

    const escapeCSV = (value: unknown) => {
      const text = String(value ?? "");
      return `"${text.replaceAll('"', '""')}"`;
    };

    const rows = filteredKeys.map((item) => [
      item.id,
      item.key,
      item.active ? "Active" : "Nonaktif",
      item.deviceId ?? "Belum digunakan",
      item.useCount ?? 0,
      item.lastUsed
        ? new Date(item.lastUsed).toLocaleString("id-ID")
        : "Belum pernah",
      item.expiresAt
        ? new Date(item.expiresAt).toLocaleString("id-ID")
        : "Permanen",
      item.createdAt
        ? new Date(item.createdAt).toLocaleString("id-ID")
        : "-",
    ]);

    const csv = [
      [
        "ID",
        "Key",
        "Status",
        "Device",
        "Jumlah Pakai",
        "Terakhir Digunakan",
        "Expired",
        "Dibuat",
      ],
      ...rows,
    ]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `vexdhub-keys-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setMessage("CSV berhasil diekspor");
  }

  if (checking) return <div className="login-page"><div className="login-card">Checking admin session...</div></div>;

  if (!loggedIn) {
    return <main className="login-page"><div className="login-card"><div className="login-logo">V</div><span className="eyebrow">Secure administration</span><h1>Welcome back</h1><p>Sign in to manage VexdHub licenses and device bindings.</p><div className="login-form"><input type="password" placeholder="Admin password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") void login();}}/><button onClick={()=>void login()}>Sign in</button>{message&&<div className="login-message">{message}</div>}</div></div></main>;
  }

  const activeCount=keys.filter(k=>k.active && !(k.expiresAt&&new Date(k.expiresAt).getTime()<Date.now())).length;
  const expiredCount=keys.filter(k=>k.expiresAt&&new Date(k.expiresAt).getTime()<Date.now()).length;
  const deviceCount=keys.filter(k=>k.deviceId).length;

  return <div className="admin-shell">
    <Sidebar activeSection="overview" onSectionChange={(id)=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"})} onLogout={()=>void logout()}/>
    <main className="admin-main"><div className="content-wrap">
      <section id="overview"><Header loading={loadingKeys} onRefresh={()=>void loadKeys()}/>
      <div className="stats-grid"><StatsCard title="Total licenses" value={keys.length} icon="⌁" helper="All generated licenses"/><StatsCard title="Active" value={activeCount} icon="✓" helper="Ready for validation" tone="success"/><StatsCard title="Expired" value={expiredCount} icon="!" helper="Past validity date" tone="warning"/><StatsCard title="Bound devices" value={deviceCount} icon="◇" helper="Locked to a device" tone="violet"/></div></section>
      <section id="generate" className="panel-grid"><GenerateCard duration={duration} setDuration={setDuration} generateKey={()=>void generateKey()}/><BatchGenerateCard onSuccess={loadKeys} onMessage={setMessage}/></section>
      <section id="licenses" className="license-section">
        <div className="section-heading"><div><span className="eyebrow">License inventory</span><h2>Manage licenses</h2><p>Search, filter, copy, reset, disable, or delete licenses.</p></div></div>
        <div className="license-toolbar"><SearchBar value={search} onChange={setSearch}/><select className="toolbar-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value as StatusFilter)}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Disabled</option><option value="expired">Expired</option><option value="bound">Device bound</option><option value="unbound">Not bound</option></select><button className="button-secondary" onClick={exportCSV}>Export CSV</button><span className="result-count">Showing {paginatedKeys.length} of {filteredKeys.length}</span></div>
        {message&&<div className="toast-message"><span>{message}</span><button onClick={()=>setMessage("")}>×</button></div>}
        <KeyTable keys={paginatedKeys} onDelete={deleteKey} onToggle={toggleKey} onReset={resetDevice} onMessage={setMessage}/>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>
      </section>
      <section id="settings" style={{height:1}} />
    </div></main>
  </div>;
}
