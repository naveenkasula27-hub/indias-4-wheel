const token = localStorage.getItem('i4w_admin_token');
if (!token) window.location.href = 'login.html';

document.getElementById('adminName').textContent = localStorage.getItem('i4w_admin_name') || 'Owner';

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers: authHeaders() });
  if (res.status === 401) {
    localStorage.removeItem('i4w_admin_token');
    window.location.href = 'login.html';
    throw new Error('Unauthorized');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// --- Tabs ---
const TAB_TITLES = { inventory: 'Manage Inventory', leads: 'Sell-Car Leads', testdrives: 'Test Drives', messages: 'Contact Messages', pricing: 'Valuation Pricing', account: 'Account' };
document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
    link.classList.add('active');
    const tab = link.dataset.tab;
    ['inventory', 'leads', 'testdrives', 'messages', 'pricing', 'account'].forEach((t) => {
      document.getElementById(`tab-${t}`).style.display = t === tab ? 'block' : 'none';
    });
    document.getElementById('pageTitle').textContent = TAB_TITLES[tab];
    if (tab === 'pricing') loadPricing();
    if (tab === 'testdrives') loadTestDrives();
    if (tab === 'messages') loadMessages();
  });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('i4w_admin_token');
  window.location.href = 'login.html';
});

// --- Inventory ---
async function loadCars() {
  const cars = await api('/cars?status=all').catch(() => []);
  const all = await fetch(`${API_BASE}/cars`).then((r) => r.json()).catch(() => []);
  renderCars(all);
}

function renderCars(cars) {
  document.getElementById('statCars').textContent = cars.length;
  document.getElementById('statSold').textContent = cars.filter((c) => c.status === 'sold').length;

  const tbody = document.getElementById('carsTableBody');
  tbody.innerHTML = cars.map((c) => `
    <tr data-id="${c._id}">
      <td>${c.name}</td>
      <td><input type="number" class="edit-price" value="${c.price}"></td>
      <td><input type="number" class="edit-emi" value="${c.emi}"></td>
      <td>${c.km.toLocaleString('en-IN')}</td>
      <td>
        <select class="edit-status">
          <option value="available" ${c.status === 'available' ? 'selected' : ''}>Available</option>
          <option value="sold" ${c.status === 'sold' ? 'selected' : ''}>Sold</option>
          <option value="hidden" ${c.status === 'hidden' ? 'selected' : ''}>Hidden</option>
        </select>
      </td>
      <td style="white-space:nowrap;">
        <button class="btn-sm btn-save" data-action="save">Save</button>
        <button class="btn-sm btn-del" data-action="delete">Delete</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" style="color:var(--slate-light);">No cars yet. Add one above.</td></tr>';

  tbody.querySelectorAll('button[data-action="save"]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const row = e.target.closest('tr');
      const id = row.dataset.id;
      const price = +row.querySelector('.edit-price').value;
      const emi = +row.querySelector('.edit-emi').value;
      const status = row.querySelector('.edit-status').value;
      await api(`/cars/${id}`, { method: 'PUT', body: JSON.stringify({ price, emi, status }) });
      loadCars();
    });
  });
  tbody.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const row = e.target.closest('tr');
      if (!confirm('Delete this listing?')) return;
      await api(`/cars/${row.dataset.id}`, { method: 'DELETE' });
      loadCars();
    });
  });
}

document.getElementById('addCarBtn').addEventListener('click', async () => {
  const body = {
    name: document.getElementById('newName').value,
    brand: document.getElementById('newBrand').value,
    model: document.getElementById('newModel').value,
    bodyType: document.getElementById('newBodyType').value,
    fuel: document.getElementById('newFuel').value,
    transmission: document.getElementById('newTransmission').value,
    year: +document.getElementById('newYear').value,
    km: +document.getElementById('newKm').value,
    city: document.getElementById('newCity').value,
    price: +document.getElementById('newPrice').value,
    emi: +document.getElementById('newEmi').value,
    photo: document.getElementById('newPhoto').value,
  };
  if (!body.name || !body.brand || !body.model || !body.year || !body.price) {
    alert('Please fill name, brand, model, year and price.');
    return;
  }
  await api('/cars', { method: 'POST', body: JSON.stringify(body) });
  ['newName','newBrand','newModel','newYear','newKm','newCity','newPrice','newEmi','newPhoto'].forEach((id) => document.getElementById(id).value = '');
  loadCars();
});

// --- Leads ---
async function loadLeads() {
  const leads = await api('/leads').catch(() => []);
  document.getElementById('statLeads').textContent = leads.length;
  document.getElementById('statNewLeads').textContent = leads.filter((l) => l.status === 'new').length;

  const tbody = document.getElementById('leadsTableBody');
  tbody.innerHTML = leads.map((l) => `
    <tr data-id="${l._id}">
      <td>${l.name}<br><span style="color:var(--slate-light);font-size:12px;">${l.phone}</span></td>
      <td>${l.brand} ${l.model} · ${l.year} · ${l.km.toLocaleString('en-IN')} km</td>
      <td>₹ ${l.valuation.toLocaleString('en-IN')}</td>
      <td>${l.loanEligibility ? `₹ ${l.loanEligibility.eligibleAmount.toLocaleString('en-IN')} @ ${l.loanEligibility.interestRate}%` : '—'}</td>
      <td style="white-space:nowrap;">
        <input type="number" class="elig-income" placeholder="Income ₹" style="width:90px;" value="${l.loanEligibility?.monthlyIncome || ''}">
        <button class="btn-sm btn-save" data-action="run-eligibility">Run</button>
      </td>
      <td>
        <select class="lead-status">
          <option value="new" ${l.status==='new'?'selected':''}>New</option>
          <option value="contacted" ${l.status==='contacted'?'selected':''}>Contacted</option>
          <option value="inspection_booked" ${l.status==='inspection_booked'?'selected':''}>Inspection Booked</option>
          <option value="closed" ${l.status==='closed'?'selected':''}>Closed</option>
          <option value="rejected" ${l.status==='rejected'?'selected':''}>Rejected</option>
        </select>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" style="color:var(--slate-light);">No leads yet.</td></tr>';

  tbody.querySelectorAll('.lead-status').forEach((sel) => {
    sel.addEventListener('change', async (e) => {
      const row = e.target.closest('tr');
      await api(`/leads/${row.dataset.id}`, { method: 'PUT', body: JSON.stringify({ status: e.target.value }) });
      loadLeads();
    });
  });

  tbody.querySelectorAll('button[data-action="run-eligibility"]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const row = e.target.closest('tr');
      const income = +row.querySelector('.elig-income').value;
      if (!income) { alert('Enter a monthly income first.'); return; }
      await api(`/leads/${row.dataset.id}/eligibility`, { method: 'PUT', body: JSON.stringify({ monthlyIncome: income }) });
      loadLeads();
    });
  });
}

// --- Test Drives ---
async function loadTestDrives() {
  const rows = await api('/test-drives').catch(() => []);
  const tbody = document.getElementById('testDrivesTableBody');
  tbody.innerHTML = rows.map((r) => `
    <tr data-id="${r._id}">
      <td>${r.name}</td>
      <td>${r.phone}</td>
      <td>${r.carName}</td>
      <td>${new Date(r.createdAt).toLocaleString('en-IN')}</td>
      <td>
        <select class="td-status">
          <option value="new" ${r.status==='new'?'selected':''}>New</option>
          <option value="scheduled" ${r.status==='scheduled'?'selected':''}>Scheduled</option>
          <option value="completed" ${r.status==='completed'?'selected':''}>Completed</option>
          <option value="cancelled" ${r.status==='cancelled'?'selected':''}>Cancelled</option>
        </select>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="color:var(--slate-light);">No test drive requests yet.</td></tr>';

  tbody.querySelectorAll('.td-status').forEach((sel) => {
    sel.addEventListener('change', async (e) => {
      const row = e.target.closest('tr');
      await api(`/test-drives/${row.dataset.id}`, { method: 'PUT', body: JSON.stringify({ status: e.target.value }) });
    });
  });
}

// --- Contact Messages ---
async function loadMessages() {
  const rows = await api('/contact').catch(() => []);
  const tbody = document.getElementById('messagesTableBody');
  tbody.innerHTML = rows.map((m) => `
    <tr data-id="${m._id}">
      <td>${m.name}</td>
      <td>${m.email}</td>
      <td style="max-width:320px;">${m.message}</td>
      <td>${new Date(m.createdAt).toLocaleString('en-IN')}</td>
      <td>
        <select class="msg-status">
          <option value="new" ${m.status==='new'?'selected':''}>New</option>
          <option value="read" ${m.status==='read'?'selected':''}>Read</option>
          <option value="replied" ${m.status==='replied'?'selected':''}>Replied</option>
        </select>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="color:var(--slate-light);">No messages yet.</td></tr>';

  tbody.querySelectorAll('.msg-status').forEach((sel) => {
    sel.addEventListener('change', async (e) => {
      const row = e.target.closest('tr');
      await api(`/contact/${row.dataset.id}`, { method: 'PUT', body: JSON.stringify({ status: e.target.value }) });
    });
  });
}

// --- Pricing ---
let pricingRows = [];
async function loadPricing() {
  pricingRows = await api('/valuation/catalog/prices').catch(() => []);
  const q = document.getElementById('pricingSearch')?.value.trim().toLowerCase() || '';
  renderPricing(q ? pricingRows.filter((r) => `${r.brand} ${r.model}`.toLowerCase().includes(q)) : pricingRows);
}

function renderPricing(rows) {
  const tbody = document.getElementById('pricingTableBody');
  tbody.innerHTML = rows.map((r) => `
    <tr data-brand="${r.brand}" data-model="${r.model}">
      <td>${r.brand}</td>
      <td>${r.model}</td>
      <td>₹ ${r.defaultPrice.toLocaleString('en-IN')}</td>
      <td><input type="number" class="price-input" value="${r.currentPrice}" style="width:120px;"></td>
      <td style="white-space:nowrap;">
        <button class="btn-sm btn-save" data-action="save-price">Save</button>
        ${r.overridden ? '<button class="btn-sm btn-del" data-action="reset-price">Reset</button>' : ''}
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="color:var(--slate-light);">No models found.</td></tr>';

  tbody.querySelectorAll('button[data-action="save-price"]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const row = e.target.closest('tr');
      const basePrice = +row.querySelector('.price-input').value;
      await api('/valuation/catalog/prices', { method: 'PUT', body: JSON.stringify({ brand: row.dataset.brand, model: row.dataset.model, basePrice }) });
      loadPricing();
    });
  });
  tbody.querySelectorAll('button[data-action="reset-price"]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const row = e.target.closest('tr');
      await api('/valuation/catalog/prices', { method: 'DELETE', body: JSON.stringify({ brand: row.dataset.brand, model: row.dataset.model }) });
      loadPricing();
    });
  });
}

document.getElementById('pricingSearch')?.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  renderPricing(pricingRows.filter((r) => `${r.brand} ${r.model}`.toLowerCase().includes(q)));
});

// --- Account ---
document.getElementById('changePwBtn')?.addEventListener('click', async () => {
  const currentPassword = document.getElementById('curPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const msg = document.getElementById('pwMsg');
  msg.textContent = '';
  try {
    await api('/auth/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });
    msg.style.color = 'var(--emerald)';
    msg.textContent = 'Password updated.';
    document.getElementById('curPassword').value = '';
    document.getElementById('newPassword').value = '';
  } catch (err) {
    msg.style.color = '#e14343';
    msg.textContent = err.message;
  }
});

loadCars();
loadLeads();
