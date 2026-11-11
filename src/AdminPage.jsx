import { useCallback, useEffect, useState } from "react";
import "./Admin.css";
import { AuthError, clearToken, getToken, login, me, setToken } from "./adminApi.js";
import AdminOrders from "./AdminOrders.jsx";
import AdminClothes from "./AdminClothes.jsx";

function Login({ onDone }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { token } = await login(password);
      setToken(token);
      onDone();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <main className="adm adm-login">
      <p className="adm-kicker">ZUEZ</p>
      <h1 className="adm-h1">Admin</h1>

      <form onSubmit={submit} className="adm-form">
        <label className="adm-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && (
          <p className="adm-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="adm-btn adm-btn--primary" disabled={busy || !password}>
          {busy ? "Checking…" : "Log in"}
        </button>
      </form>

      <p className="adm-note">
        <a href="#/">← Back to the shop</a>
      </p>
    </main>
  );
}

function AdminPage() {
  const [authed, setAuthed] = useState(!!getToken());
  const [tab, setTab] = useState("orders");
  const [uploads, setUploads] = useState(false);
  const [checking, setChecking] = useState(!!getToken());

  const logout = useCallback(() => {
    clearToken();
    setAuthed(false);
  }, []);

  // a saved token might have expired: ask the server once
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;

    me()
      .then((r) => {
        if (!cancelled) {
          setUploads(!!r.uploads);
          setChecking(false);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof AuthError) logout();
        setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authed, logout]);

  if (!authed) {
    return (
      <Login
        onDone={() => {
          setChecking(true);
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <main className="adm">
      <header className="adm-top">
        <div>
          <p className="adm-kicker">ZUEZ</p>
          <h1 className="adm-h1">Admin</h1>
        </div>

        <div className="adm-top-actions">
          <a className="adm-link" href="#/">
            View shop
          </a>
          <button type="button" className="adm-link" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <div className="adm-tabs" role="tablist" aria-label="Admin sections">
        {[
          ["orders", "Orders"],
          ["clothes", "Clothes"],
        ].map(([id, label]) => (
          <button
            type="button"
            role="tab"
            key={id}
            aria-selected={tab === id}
            className={`adm-tab ${tab === id ? "is-active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {checking ? (
        <p className="adm-note">Loading…</p>
      ) : tab === "orders" ? (
        <AdminOrders onAuthError={logout} />
      ) : (
        <AdminClothes onAuthError={logout} uploadsReady={uploads} />
      )}
    </main>
  );
}

export default AdminPage;
