// All talking to the backend happens here.
// VITE_API_URL is set in .env (local) or in Vercel's settings (live).
const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(API + path, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new Error("Couldn't reach the shop. Check your connection and try again.");
  }

  const data = await res.json().catch(() => null);

  // A web page came back instead of JSON: the address is pointing at the
  // wrong place (e.g. the website itself) instead of the backend.
  if (data === null) {
    throw new Error(
      `The shop server sent an unexpected reply from ${API + path}. ` +
        "Check VITE_API_URL points to the backend."
    );
  }

  if (!res.ok) throw new Error(data?.error || "Something went wrong. Please try again.");
  return data;
}

export const getProducts = (signal) => request("/api/products", { signal });
export const getZones = (signal) => request("/api/shipping-zones", { signal });
export const getOrder = (ref, signal) =>
  request(`/api/orders/${encodeURIComponent(ref)}`, { signal });
export const createOrder = (body) =>
  request("/api/checkout", { method: "POST", body: JSON.stringify(body) });
