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
document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
    link.classList.add('active');
    const tab = link.dataset.tab;
    document.getElementById('tab-inventory').style.display = tab === 'inventory' ? 'block' : 'none';
    document.getElementById('tab-leads').style.display = tab === 'leads' ? 'block' : 'none';
    document.getElementById('pageTitle').textContent = tab === 'inventory' ? 'Manage Inventory' : 'Sell-Car Leads';
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
      <td><span class="badge-pill badge-${l.status}">${l.status}</span></td>
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
}

loadCars();
loadLeads();
