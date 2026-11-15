document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('loginError');
  errorEl.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('i4w_admin_token', data.token);
    localStorage.setItem('i4w_admin_name', data.admin.name);
    window.location.href = 'dashboard.html';
  } catch (err) {
    errorEl.textContent = err.message === 'Failed to fetch'
      ? 'Could not reach the server. Is the backend running?'
      : err.message;
    errorEl.style.display = 'block';
  }
});
