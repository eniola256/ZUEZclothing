// Everything the admin screens say to the backend. The login token lives in
// sessionStorage, so closing the tab logs you out.
const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
const KEY = "zuez-admin-token";

export const getToken = () => {
  try {
    return sessionStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
};
export const setToken = (t) => {
  try {
    sessionStorage.setItem(KEY, t);
  } catch {
    /* blocked storage: you'll just have to log in again after a refresh */
  }
};
export const clearToken = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
};

// thrown when the server says "log in again"
export class AuthError extends Error {}

async function call(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(API + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Couldn't reach the server. It may be waking up: try again in a moment.");
  }

  const data = await res.json().catch(() => null);
  if (res.status === 401 && path !== "/api/admin/login") {
    clearToken();
    throw new AuthError(data?.error || "Please log in again.");
  }
  if (!res.ok) throw new Error(data?.error || "Something went wrong.");
  return data;
}

export const login = (password) => call("/api/admin/login", { method: "POST", body: { password } });
export const me = () => call("/api/admin/me");

export const listOrders = ({ status = "all", q = "" } = {}) =>
  call(`/api/admin/orders?status=${encodeURIComponent(status)}&q=${encodeURIComponent(q)}`);
export const getOrder = (ref) => call(`/api/admin/orders/${encodeURIComponent(ref)}`);
export const setOrderStatus = (ref, status, trackingNote = "") =>
  call(`/api/admin/orders/${encodeURIComponent(ref)}/status`, { method: "POST", body: { status, trackingNote } });
export const resolveOrder = (ref) => call(`/api/admin/orders/${encodeURIComponent(ref)}/resolve`, { method: "POST" });

export const listProducts = () => call("/api/admin/products");
export const saveProduct = (p) =>
  p.id ? call(`/api/admin/products/${p.id}`, { method: "PUT", body: p }) : call("/api/admin/products", { method: "POST", body: p });
export const setProductActive = (id, active) =>
  call(`/api/admin/products/${id}/active`, { method: "POST", body: { active } });

// Photos go from the browser straight to Cloudinary using a short-lived signed permission
export async function uploadImage(file) {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't an image.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Photos must be under 10 MB.");

  const perm = await call("/api/admin/upload-permission");
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", perm.apiKey);
  form.append("timestamp", perm.timestamp);
  form.append("folder", perm.folder);
  form.append("signature", perm.signature);

  let res;
  try {
    res = await fetch(perm.uploadUrl, { method: "POST", body: form });
  } catch {
    throw new Error("The upload failed. Check your connection and try again.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.secure_url) throw new Error(data?.error?.message || "Cloudinary refused the upload.");
  return data.secure_url;
}
