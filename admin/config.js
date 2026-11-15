// Points the admin dashboard and frontend fetch calls at the backend API.
// Change this to your deployed backend URL (e.g. Vercel/Render) once live.
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:4000/api'
  : 'https://indias-4-wheel-fztk.vercel.app/api';
