// ============ INVENTORY / BROWSE PAGE ============

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('invGrid');
  const countEl = document.getElementById('resultCount');
  const emptyEl = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const filterBody = document.getElementById('filterBody');
  const filterFuel = document.getElementById('filterFuel');
  const filterBrand = document.getElementById('filterBrand');
  const filterPrice = document.getElementById('filterPrice');
  const sortBy = document.getElementById('sortBy');

  grid.innerHTML = Array.from({ length: 8 }).map(() => '<div class="car-card skeleton-card"><div class="car-media"></div><div class="car-body"><div class="skeleton-line" style="width:70%"></div><div class="skeleton-line" style="width:50%"></div></div></div>').join('');
  const CARS = await loadCars();

  // Populate brand filter dynamically
  const brands = [...new Set(CARS.map(c => c.brand))].sort();
  filterBrand.innerHTML += brands.map(b => `<option value="${b}">${b}</option>`).join('');

  const cardHtml = (c) => `
    <a class="car-card" href="car-detail.html?id=${c.id}">
      <div class="car-media">
        <button class="save-car-btn" data-car-id="${c.id}" aria-label="Save car">♡</button>
        <span class="car-badge">${c.badge}</span>
        <span class="car-fuel">${c.fuel}</span>
        <img src="${c.photo}" alt="${c.name}" loading="lazy" class="${c.aged ? 'img-aged' : ''}">
      </div>
      <div class="car-body">
        <h4>${c.name}</h4>
        <p class="car-meta">${c.year} · ${formatKm(c.km)} · ${c.fuel} · ${c.city}</p>
        <div class="car-price-row">
          <span class="car-price">${formatPrice(c.price)}</span>
          <span class="car-emi">${formatEmi(c.emi)}</span>
        </div>
        <span class="car-cta">View Details</span>
      </div>
    </a>
  `;

  function render() {
    const q = searchInput.value.trim().toLowerCase();
    const body = filterBody.value;
    const fuel = filterFuel.value;
    const brand = filterBrand.value;
    const priceRange = filterPrice.value;
    const sort = sortBy.value;

    let results = CARS.filter(c => {
      if (q && !(`${c.brand} ${c.name}`.toLowerCase().includes(q))) return false;
      if (body && c.bodyType !== body) return false;
      if (fuel && c.fuel !== fuel) return false;
      if (brand && c.brand !== brand) return false;
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (c.price < min || c.price > max) return false;
      }
      return true;
    });

    switch (sort) {
      case 'price-asc': results.sort((a, b) => a.price - b.price); break;
      case 'price-desc': results.sort((a, b) => b.price - a.price); break;
      case 'km-asc': results.sort((a, b) => a.km - b.km); break;
      case 'year-desc': results.sort((a, b) => b.year - a.year); break;
    }

    countEl.innerHTML = `Showing <strong>${results.length}</strong> of ${CARS.length} cars`;
    grid.innerHTML = results.map(cardHtml).join('');
    grid.style.display = results.length ? 'grid' : 'none';
    emptyEl.style.display = results.length ? 'none' : 'block';
    window.i4wInitSaveButtons?.(grid);
  }

  [searchInput, filterBody, filterFuel, filterBrand, filterPrice, sortBy].forEach(el => {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  render();

  /* ---------- Mobile nav toggle (shared behavior) ---------- */
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
