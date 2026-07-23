"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ActivityPanel from "@/components/ActivityPanel";
import KeyTable from "@/components/KeyTable";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import AdminAuthView from "@/components/AdminAuthView";
import OverviewSection from "@/components/OverviewSection";
import LicenseDetailModal from "@/components/LicenseDetailModal";

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

type ActivityItem = {
  id: number;
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
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [duration, setDuration] = useState("30");
  const [message, setMessage] = useState("");
  const [newKey, setNewKey] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [activeSection, setActiveSection] =
    useState("overview");

  const [activities, setActivities] = useState<
    ActivityItem[]
  >([]);

  const [selectedLicense, setSelectedLicense] =
  useState<KeyType | null>(null);

  const addActivity = useCallback(
  (
    title: string,
    detail: string,
    tone: ActivityItem["tone"] = "info"
  ) => {
    const time = new Date().toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    setActivities((current) =>
      [
        {
          id: Date.now(),
          title,
          detail,
          time,
          tone,
        },
        ...current,
      ].slice(0, 50)
    );
  },
  []
);

  const notify = useCallback((text: string) => {
    setMessage(text);

    window.setTimeout(() => {
      setMessage((current) =>
        current === text ? "" : current
      );
    }, 3500);
  }, []);

  const loadKeys = useCallback(async () => {
    const controller = new AbortController();

    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 30000);

    try {
      setLoadingKeys(true);

      const response = await fetch("/api/keys", {
        cache: "no-store",
        signal: controller.signal,
      });

      const text = await response.text();

      let data: KeyType[];

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Respons daftar license tidak valid"
        );
      }

      if (!response.ok) {
        throw new Error(
          "Gagal mengambil daftar license"
        );
      }

      setKeys(data);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        notify(
          "Database terlalu lama merespons. Tekan Refresh Data."
        );

        return;
      }

      notify(
        error instanceof Error
          ? error.message
          : "Gagal memuat license"
      );
    } finally {
      window.clearTimeout(timeout);
      setLoadingKeys(false);
    }
  }, [notify]);

  const loadActivities = useCallback(async () => {
  try {
    const response = await fetch("/api/activity", {
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ?? "Gagal mengambil activity"
      );
    }

    const formattedActivities: ActivityItem[] =
      data.activities.map(
        (item: {
          id: number;
          action: string;
          detail: string;
          tone: string;
          createdAt: string;
        }) => ({
          id: item.id,
          title: item.action,
          detail: item.detail,
          tone:
            item.tone === "success" ||
            item.tone === "warning"
              ? item.tone
              : "info",
          time: new Date(
            item.createdAt
          ).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
      );

    setActivities(formattedActivities);
  } catch (error) {
    console.error("Load activity error:", error);
  }
}, []);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/admin-check",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (data.success) {
        setLoggedIn(true);
        setChecking(false);

        void Promise.all([
  loadKeys(),
  loadActivities(),
]);

        return;
      }

      setLoggedIn(false);
    } catch {
      notify("Gagal memeriksa sesi admin");
    } finally {
      setChecking(false);
    }
  }, [loadActivities, loadKeys, notify]);
  useEffect(() => {
    void checkSession();
  }, [checkSession]);
  useEffect(() => {
  if (!loggedIn) {
    return;
  }

  const interval = window.setInterval(() => {
    void loadActivities();
  }, 15000);

  return () => {
    window.clearInterval(interval);
  };
}, [loggedIn, loadActivities]);
  

  async function login() {
    try {
      notify("Memeriksa password...");

      const response = await fetch(
        "/api/admin-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        notify(data.message ?? "Password salah");
        return;
      }

      setLoggedIn(true);
      notify("Login berhasil");

      addActivity(
        "Admin login",
        "Sesi owner berhasil dibuka",
        "success"
      );

      await Promise.all([
        loadKeys(),
        loadActivities(),
      ]);
    } catch {
      notify("Login gagal. Coba lagi.");
    }
  }

  async function logout() {
    await fetch("/api/admin-logout", {
      method: "POST",
    });

    setLoggedIn(false);
    setPassword("");
    setKeys([]);
    setActivities([]);
    setMessage("");
    setNewKey("");
  }

  async function generateKey() {
  if (generating) {
    return;
  }

  const random = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 10)
    .toUpperCase();

  const temporaryKey = `VEXD-${random}`;

  // Langsung tampilkan key di GenerateCard
  setNewKey(temporaryKey);
  setGenerating(true);

  try {
    const response = await fetch("/api/keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: temporaryKey,
        duration,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setNewKey("");

      throw new Error(
        data.message ?? "Gagal membuat license"
      );
    }

    const createdKey: KeyType = data.data;

    // Gunakan key asli yang dikembalikan server
    setNewKey(createdKey.key);

    // Masukkan langsung ke License Manager
    // tanpa menunggu GET /api/keys
    setKeys((currentKeys) => {
      const alreadyExists = currentKeys.some(
        (item) => item.id === createdKey.id
      );

      if (alreadyExists) {
        return currentKeys;
      }

      return [createdKey, ...currentKeys];
    });

    setCurrentPage(1);

    notify(
      `License berhasil dibuat: ${createdKey.key}`
    );

    addActivity(
      "License generated",
      createdKey.key,
      "success"
    );

    void loadActivities();

  } catch (error) {
    setNewKey("");

    notify(
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat membuat license"
    );
  } finally {
    setGenerating(false);
  }
}

  async function deleteKey(id: number) {
    try {
      const target = keys.find(
        (item) => item.id === id
      );

      const response = await fetch("/api/keys", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        notify(
          data.message ?? "Gagal menghapus license"
        );
        return;
      }

      notify("License berhasil dihapus");

      addActivity(
  "License deleted",
  target?.key ?? `ID ${id}`,
  "warning"
);

void Promise.all([
  loadKeys(),
  loadActivities(),
]);
    } catch {
      notify("Gagal menghapus license");
    }
  }

  async function resetDevice(id: number) {
    try {
      const target = keys.find(
        (item) => item.id === id
      );

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

      if (!response.ok || !data.success) {
        notify(
          data.message ?? "Gagal mereset device"
        );
        return;
      }

      notify("Device berhasil direset");

      addActivity(
  "Device reset",
  target?.key ?? `ID ${id}`,
  "info"
);

void Promise.all([
  loadKeys(),
  loadActivities(),
]);
    } catch {
      notify("Gagal mereset device");
    }
  }

  async function toggleKey(id: number) {
    try {
      const target = keys.find(
        (item) => item.id === id
      );

      const response = await fetch(
        "/api/toggle-key",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        notify(
          data.message ??
            "Gagal mengubah status license"
        );
        return;
      }

      notify("Status license berhasil diubah");

      addActivity(
        "Status changed",
        target?.key ?? `ID ${id}`,
        "info"
      );

      void loadKeys();
    } catch {
      notify(
        "Gagal mengubah status license"
      );
    }
  }

  const filteredKeys = useMemo(() => {
    const now = Date.now();
    const keyword = search.trim().toLowerCase();

    return keys.filter((item) => {
      const expired = Boolean(
        item.expiresAt &&
          new Date(item.expiresAt).getTime() < now
      );

      const matchesSearch =
        item.key.toLowerCase().includes(keyword) ||
        (item.deviceId ?? "")
          .toLowerCase()
          .includes(keyword);

      const statusMatches =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          item.active &&
          !expired) ||
        (statusFilter === "inactive" &&
          !item.active) ||
        (statusFilter === "expired" &&
          expired) ||
        (statusFilter === "bound" &&
          Boolean(item.deviceId)) ||
        (statusFilter === "unbound" &&
          !item.deviceId);

      return matchesSearch && statusMatches;
    });
  }, [keys, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredKeys.length / ITEMS_PER_PAGE
    )
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedKeys = useMemo(() => {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredKeys.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredKeys, currentPage]);

  function exportCSV() {
    if (filteredKeys.length === 0) {
      notify("Tidak ada data untuk diekspor");
      return;
    }

    const escapeCSV = (value: unknown) =>
      `"${String(value ?? "").replaceAll(
        '"',
        '""'
      )}"`;

    const rows = filteredKeys.map((item) => [
      item.id,
      item.key,
      item.active ? "Active" : "Nonaktif",
      item.deviceId ?? "Belum digunakan",
      item.useCount ?? 0,
      item.lastUsed
        ? new Date(
            item.lastUsed
          ).toLocaleString("id-ID")
        : "Belum pernah",
      item.expiresAt
        ? new Date(
            item.expiresAt
          ).toLocaleString("id-ID")
        : "Permanen",
      item.createdAt
        ? new Date(
            item.createdAt
          ).toLocaleString("id-ID")
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
      .map((row) =>
        row.map(escapeCSV).join(",")
      )
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

    notify("CSV berhasil diekspor");

    addActivity(
      "CSV exported",
      `${filteredKeys.length} license`,
      "info"
    );
  }

  function navigateTo(section: string) {
    setActiveSection(section);

    const element =
      document.getElementById(section);

    element?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

 const authView = (
  <AdminAuthView
    checking={checking}
    loggedIn={loggedIn}
    password={password}
    message={message}
    setPassword={setPassword}
    onLogin={() => void login()}
  />
);

if (checking || !loggedIn) {
  return authView;
}

  return (
    <main className="app-shell">
      <Sidebar
        activeSection={activeSection}
        onSelect={navigateTo}
        onLogout={() => void logout()}
      />

      <div className="app-main">
        <Topbar
          loading={loadingKeys}
          onRefresh={() => void loadKeys()}
        />

        {message && (
          <div className="toast-message">
            <span>✓</span>
            {message}
          </div>
        )}

 <OverviewSection
  keys={keys}
  duration={duration}
  generating={generating}
  generatedKey={newKey}
  setDuration={setDuration}
  onGenerate={() => void generateKey()}
  onLoadKeys={loadKeys}
  onMessage={notify}
  onActivity={(title, detail) =>
    addActivity(title, detail, "success")
  }
/>

        <section
          id="licenses"
          className="dashboard-section"
        >
          <div className="section-heading license-heading">
            <div>
              <p className="eyebrow">MANAGEMENT</p>

              <h2>License Manager</h2>

              <p className="section-copy">
                Cari, filter, ekspor, dan kelola seluruh license.
              </p>
            </div>

            <span className="count-badge">
              {filteredKeys.length} hasil
            </span>
          </div>

          <div className="toolbar panel">
            <SearchBar
              value={search}
              onChange={setSearch}
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter
                )
              }
            >
              <option value="all">
                Semua Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Nonaktif
              </option>

              <option value="expired">
                Expired
              </option>

              <option value="bound">
                Device Terikat
              </option>

              <option value="unbound">
                Belum Terikat
              </option>
            </select>

            <button
              type="button"
              className="button-secondary"
              onClick={exportCSV}
            >
              Export CSV
            </button>

            <button
              type="button"
              className="button-ghost"
              onClick={() => void loadKeys()}
              disabled={loadingKeys}
            >
              Refresh Data
            </button>
          </div>

          {loadingKeys && keys.length === 0 ? (
            <div className="panel">
              <p>Memuat daftar license...</p>
            </div>
          ) : (
            <>
              <KeyTable
               keys={paginatedKeys}
               onDetail={setSelectedLicense}
               onDelete={deleteKey}
               onToggle={toggleKey}
               onReset={resetDevice}
               onNotify={notify}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </section>

        <ActivityPanel items={activities} />

        <section
          id="settings"
          className="panel settings-panel"
        >
          <div>
            <p className="eyebrow">
              APPEARANCE
            </p>

            <h2>Theme Settings</h2>

            <p className="section-copy">
              Gunakan pemilih tema di kanan
              atas. Pilihan tersimpan otomatis
              di browser.
            </p>
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
              <div
                className="theme-preview"
                key={label}
              >
                <span
                  style={{
                    background: color,
                  }}
                />

                {label}
              </div>
            ))}
          </div>
        </section>

        <footer className="app-footer">
          <span>VexdHub V5</span>
          <span>Neon Connected</span>
          <span>© 2026 VexdReal</span>
        </footer>
      </div>
      <LicenseDetailModal
        license={selectedLicense}
        onClose={() => setSelectedLicense(null)}
        onReset={(id) => {
          void resetDevice(id);
        }}
        onDelete={(id) => {
          void deleteKey(id);
        }}
        onNotify={notify}
     />
    </main>
  );
}