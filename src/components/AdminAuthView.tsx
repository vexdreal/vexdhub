"use client";

type Props = {
  checking: boolean;
  loggedIn: boolean;
  password: string;
  message: string;
  setPassword: (value: string) => void;
  onLogin: () => void;
};

export default function AdminAuthView({
  checking,
  loggedIn,
  password,
  message,
  setPassword,
  onLogin,
}: Props) {
  if (checking) {
    return (
      <main className="center-screen vexdhub-loading-screen">
        <div className="vexdhub-loading-brand">
          <img
            src="/branding/logo.png"
            alt="VexdHub Logo"
            className="vexdhub-loading-logo"
          />

          <strong>VEXDHUB</strong>
          <span>Smart License System</span>
        </div>

        <div
          className="vexdhub-loading-spinner"
          aria-hidden="true"
        />

        <p>Memeriksa sesi admin...</p>
      </main>
    );
  }

  if (loggedIn) {
    return null;
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <img
          src="/branding/logo.png"
          alt="VexdHub Logo"
          className="auth-brand-logo"
        />

        <p className="eyebrow">VEXDHUB</p>

        <h1>Welcome Back</h1>

        <p className="auth-copy">
          Smart License System
        </p>

        <label
          className="field-label"
          htmlFor="admin-password"
        >
          Admin Password
        </label>

        <input
          id="admin-password"
          type="password"
          placeholder="Masukkan password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onLogin();
            }
          }}
        />

        <button
          type="button"
          className="button-primary full-width"
          onClick={onLogin}
        >
          Login to Console
        </button>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}