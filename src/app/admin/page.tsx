"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import GenerateCard from "@/components/GenerateCard";
import Header from "@/components/Header";
import KeyTable from "@/components/KeyTable";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
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

  const expiredCount = keys.filter(
    (item) =>
      item.expiresAt &&
      new Date(item.expiresAt).getTime() < Date.now()
  ).length;

  if (checking) {
    return (
      <main>
        <p>Memeriksa sesi admin...</p>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main>
        <div className="login-card">
          <h1>VexdHub Admin</h1>

          <p>Masukkan password admin</p>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void login();
              }
            }}
          />

          <button onClick={() => void login()}>
            Login
          </button>

          {message && <p>{message}</p>}
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="login-card">
        <Header />

        <button
          onClick={() => void logout()}
          style={{ marginBottom: "20px" }}
        >
          Logout
        </button>

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}
        >
          <StatsCard
            title="Total Key"
            value={keys.length}
          />

          <StatsCard
            title="Active"
            value={
              keys.filter((item) => item.active).length
            }
          />

          <StatsCard
            title="Expired"
            value={expiredCount}
          />

          <StatsCard
            title="Device"
            value={
              keys.filter((item) => item.deviceId).length
            }
          />
        </div>

        <GenerateCard
          duration={duration}
          setDuration={setDuration}
          generateKey={() => void generateKey()}
        />

        <SearchBar
          value={search}
          onChange={setSearch}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "10px",
            marginBottom: "22px",
          }}
        >
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as StatusFilter
              )
            }
            style={{
              width: "auto",
              minWidth: "190px",
              margin: 0,
            }}
          >
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="inactive">Nonaktif</option>
            <option value="expired">Expired</option>
            <option value="bound">Device Terikat</option>
            <option value="unbound">
              Belum Terikat
            </option>
          </select>

          <button onClick={exportCSV}>
            Export CSV
          </button>

          <button onClick={() => void loadKeys()}>
            {loadingKeys ? "Memuat..." : "Refresh Data"}
          </button>

          <span
            style={{
              color: "#9ca3af",
              marginLeft: "auto",
            }}
          >
            Menampilkan {paginatedKeys.length} dari{" "}
            {filteredKeys.length} hasil
          </span>
        </div>

        {message && (
          <p
            style={{
              marginBottom: "18px",
              color: "#8ec5ff",
            }}
          >
            {message}
          </p>
        )}

        <KeyTable
          keys={paginatedKeys}
          onDelete={deleteKey}
          onToggle={toggleKey}
          onReset={resetDevice}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </main>
  );
}