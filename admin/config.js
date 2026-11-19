// Points the admin dashboard and frontend fetch calls at the backend API.
// Change this to your deployed backend URL (e.g. Vercel/Render) once live.
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:4000/api'
  : 'https://indias-4-wheel-fztk.vercel.app/api';

// Shared cold-start-tolerant fetch — the serverless backend can take
// several seconds to wake up after being idle, which previously left
// dropdowns, buttons and forms stuck on "Loading..." far longer than
// felt responsive. Every caller of this either has a local fallback or
// already tolerates a failed/aborted request gracefully, so aborting
// after a bounded wait is always the right call, never a silent hang.
function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}
