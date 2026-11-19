// ============ CUSTOMER ACCOUNT PAGE ============

document.addEventListener('DOMContentLoaded', () => {
  const apiBase = typeof API_BASE !== 'undefined' ? API_BASE : null;
  const token = localStorage.getItem('i4w_customer_token');

  // --- Tab switching (logged-out view) ---
  document.querySelectorAll('.account-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.account-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.account-form').forEach((f) => f.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`${tab.dataset.form}FormC`).classList.add('active');
    });
  });

  function saveSession(token, customer) {
    localStorage.setItem('i4w_customer_token', token);
    localStorage.setItem('i4w_customer_name', customer.name);
    localStorage.setItem('i4w_customer_email', customer.email);
  }

  document.getElementById('loginFormC').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('loginErrorC');
    errorEl.style.display = 'none';
    try {
      if (!apiBase) throw new Error('The backend isn\'t reachable right now.');
      const res = await fetchWithTimeout(`${apiBase}/customer/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: document.getElementById('loginEmail').value, password: document.getElementById('loginPassword').value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      saveSession(data.token, data.customer);
      window.location.reload();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  });

  document.getElementById('signupFormC').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('signupErrorC');
    errorEl.style.display = 'none';
    try {
      if (!apiBase) throw new Error('The backend isn\'t reachable right now.');
      const res = await fetchWithTimeout(`${apiBase}/customer/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('suName').value,
          email: document.getElementById('suEmail').value,
          phone: document.getElementById('suPhone').value,
          password: document.getElementById('suPassword').value,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign up failed');
      saveSession(data.token, data.customer);
      window.location.reload();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  });

  // --- Mobile OTP login ---
  document.getElementById('sendOtpBtn').addEventListener('click', async () => {
    const errorEl = document.getElementById('otpErrorC');
    const devNotice = document.getElementById('otpDevNotice');
    errorEl.style.display = 'none';
    const phone = document.getElementById('otpPhone').value;
    if (!/^[0-9]{10}$/.test(phone)) {
      errorEl.textContent = 'Enter a valid 10-digit mobile number';
      errorEl.style.display = 'block';
      return;
    }
    try {
      if (!apiBase) throw new Error('The backend isn\'t reachable right now.');
      const res = await fetchWithTimeout(`${apiBase}/customer/otp/request`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send OTP');
      document.getElementById('otpCodeField').style.display = 'block';
      if (data.devOtp) {
        devNotice.style.display = 'block';
        devNotice.textContent = `Demo mode (no SMS provider connected yet): your OTP is ${data.devOtp}`;
      } else {
        devNotice.style.display = 'none';
      }
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  });

  document.getElementById('resendOtpBtn').addEventListener('click', () => {
    document.getElementById('sendOtpBtn').click();
  });

  document.getElementById('otpFormC').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('otpErrorC');
    errorEl.style.display = 'none';
    try {
      if (!apiBase) throw new Error('The backend isn\'t reachable right now.');
      const res = await fetchWithTimeout(`${apiBase}/customer/otp/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: document.getElementById('otpPhone').value, code: document.getElementById('otpCode').value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      saveSession(data.token, data.customer);
      window.location.reload();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  });

  // --- Logged-in view ---
  if (token) {
    loadProfile();
  }

  async function loadProfile() {
    try {
      const res = await fetchWithTimeout(`${apiBase}/customer/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('session expired');
      const data = await res.json();

      document.getElementById('authView').style.display = 'none';
      document.getElementById('profileView').style.display = 'block';
      document.getElementById('profileGreeting').textContent = `Hi, ${data.name.split(' ')[0]}!`;

      const grid = document.getElementById('savedCarsGrid');
      const noSaved = document.getElementById('noSavedCars');
      if (!data.savedCars.length) {
        grid.innerHTML = '';
        noSaved.style.display = 'block';
      } else {
        noSaved.style.display = 'none';
        grid.innerHTML = data.savedCars.map((c) => `
          <a class="car-card" href="car-detail.html?id=${c._id}">
            <div class="car-media">
              <span class="car-badge">${c.badge || ''}</span>
              <img src="${c.photo}" alt="${c.name}" loading="lazy">
            </div>
            <div class="car-body">
              <h4>${c.name}</h4>
              <p class="car-meta">${c.year} · ${c.km.toLocaleString('en-IN')} km · ${c.fuel}</p>
              <div class="car-price-row">
                <span class="car-price">₹ ${(c.price / 100000).toFixed(1)} Lakh</span>
              </div>
            </div>
          </a>
        `).join('');
      }

      const subBody = document.getElementById('mySubmissionsBody');
      subBody.innerHTML = data.leads.map((l) => `
        <tr>
          <td>${l.brand} ${l.model} · ${l.year}</td>
          <td>₹ ${l.valuation.toLocaleString('en-IN')}</td>
          <td><span class="badge-pill badge-${l.status}">${l.status}</span></td>
        </tr>
      `).join('') || '<tr><td colspan="3" style="color:var(--slate-light);">No submissions yet.</td></tr>';
    } catch {
      localStorage.removeItem('i4w_customer_token');
      localStorage.removeItem('i4w_customer_name');
      localStorage.removeItem('i4w_customer_email');
    }
  }

  document.getElementById('logoutBtnC')?.addEventListener('click', () => {
    localStorage.removeItem('i4w_customer_token');
    localStorage.removeItem('i4w_customer_name');
    localStorage.removeItem('i4w_customer_email');
    window.location.reload();
  });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle?.addEventListener('click', () => {
    const open = mainNav.style.display === 'flex';
    mainNav.style.display = open ? 'none' : 'flex';
    mainNav.style.flexDirection = 'column';
    mainNav.style.position = 'absolute';
    mainNav.style.top = '76px';
    mainNav.style.left = '0';
    mainNav.style.right = '0';
    mainNav.style.background = '#fff';
    mainNav.style.padding = '18px 24px';
    mainNav.style.boxShadow = '0 10px 24px rgba(11,42,91,0.12)';
  });
});
