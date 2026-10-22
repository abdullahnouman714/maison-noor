// local dev -> the Express server on :5000. In production the API lives on the
// same Vercel domain under /api, unless VITE_API_URL points somewhere else.
const BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");
export async function api(path, opts = {}) {
  const token = localStorage.getItem("mn-token");
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
export const money = (n) => "$" + Number(n).toFixed(0);
