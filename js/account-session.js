// ============ SHARED ACROSS PAGES: CITY PICKER + CUSTOMER SESSION STATE ============

// --- Save (heart) buttons on car cards, shared by homepage/inventory/detail grids ---
let i4wSavedCarIdsPromise = null;
function i4wGetSavedCarIds() {
  const token = localStorage.getItem('i4w_customer_token');
  const apiBase = typeof API_BASE !== 'undefined' ? API_BASE : null;
  if (!token || !apiBase) return Promise.resolve(new Set());
  if (!i4wSavedCarIdsPromise) {
    i4wSavedCarIdsPromise = fetch(`${apiBase}/customer/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : { savedCars: [] }))
      .then((data) => new Set(data.savedCars.map((c) => c._id)))
      .catch(() => new Set());
  }
  return i4wSavedCarIdsPromise;
}

async function i4wInitSaveButtons(root = document) {
  const buttons = root.querySelectorAll('.save-car-btn[data-car-id]');
  if (!buttons.length) return;
  const saved = await i4wGetSavedCarIds();
  const token = localStorage.getItem('i4w_customer_token');
  const apiBase = typeof API_BASE !== 'undefined' ? API_BASE : null;

  buttons.forEach((btn) => {
    const carId = btn.dataset.carId;
    if (saved.has(carId)) { btn.classList.add('active'); btn.textContent = '♥'; }

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!token) { window.location.href = 'account.html'; return; }
      const isSaved = btn.classList.contains('active');
      const method = isSaved ? 'DELETE' : 'POST';
      await fetch(`${apiBase}/customer/saved-cars/${carId}`, { method, headers: { Authorization: `Bearer ${token}` } });
      btn.classList.toggle('active', !isSaved);
      btn.textContent = isSaved ? '♡' : '♥';
      if (isSaved) saved.delete(carId); else saved.add(carId);
    });
  });
}
window.i4wInitSaveButtons = i4wInitSaveButtons;

document.addEventListener('DOMContentLoaded', () => {
  // City picker — persists the chosen city across pages
  const citySelect = document.getElementById('cityBtn');
  if (citySelect) {
    const savedCity = localStorage.getItem('i4w_city');
    if (savedCity && [...citySelect.options].some(o => o.value === savedCity)) {
      citySelect.value = savedCity;
    }
    citySelect.addEventListener('change', () => {
      localStorage.setItem('i4w_city', citySelect.value);
    });
  }

  // Header "Login" link reflects whether a customer is signed in
  const loginLink = document.getElementById('headerLoginLink');
  const customerName = localStorage.getItem('i4w_customer_name');
  if (loginLink && customerName) {
    loginLink.textContent = `Hi, ${customerName.split(' ')[0]}`;
    loginLink.href = 'account.html';
  }
});
