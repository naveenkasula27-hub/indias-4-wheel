// ============ CAR DETAIL PAGE ============

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const car = getCarById(params.get('id')) || CARS[0];

  document.getElementById('pageTitle').textContent = `${car.name} — India's 4 Wheel`;
  document.getElementById('breadcrumbName').textContent = car.name;
  document.getElementById('detailBrandTag').textContent = car.brand + ' · ' + car.bodyType;
  document.getElementById('detailName').textContent = car.name;
  document.getElementById('detailMeta').textContent =
    `${car.year} · ${formatKm(car.km)} · ${car.fuel} · ${car.transmission} · ${car.owners === 1 ? '1st Owner' : car.owners + ' Owners'} · ${car.city}`;
  document.getElementById('detailPrice').textContent = formatPrice(car.price);
  document.getElementById('detailEmi').textContent = formatEmi(car.emi);
  document.getElementById('detailBadge').textContent = car.badge;

  const mainPhoto = document.getElementById('mainPhoto');
  mainPhoto.src = car.photo;
  mainPhoto.alt = car.name;
  mainPhoto.className = car.aged ? 'img-aged' : '';

  const photos = [car.photo, car.interior, car.photo, car.interior];
  document.getElementById('thumbRow').innerHTML = photos.map((p, i) => `
    <div class="thumb ${i === 0 ? 'active' : ''}" data-src="${p}">
      <img src="${p}" alt="View ${i + 1}">
    </div>
  `).join('');
  document.querySelectorAll('.thumb').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.thumb').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      mainPhoto.src = t.dataset.src;
    });
  });

  const specs = [
    ['Make', car.brand], ['Model Year', car.year], ['KM Driven', formatKm(car.km)],
    ['Fuel Type', car.fuel], ['Transmission', car.transmission], ['Owners', car.owners],
    ['Body Type', car.bodyType], ['City', car.city], ['RC Status', 'Clear'],
  ];
  document.getElementById('specsGrid').innerHTML = specs.map(([k, v]) => `
    <div class="spec-item"><span>${k}</span><strong>${v}</strong></div>
  `).join('');

  // EMI calculator (20% down, 60 months, ~10.5% flat approximation already baked into car.emi)
  document.getElementById('emiPrice').textContent = formatPrice(car.price);
  document.getElementById('emiDown').textContent = formatPrice(Math.round(car.price * 0.2));
  document.getElementById('emiMonthly').textContent = `₹${car.emi.toLocaleString('en-IN')}`;

  // Similar cars: same body type, excluding current
  const similar = CARS.filter(c => c.bodyType === car.bodyType && c.id !== car.id).slice(0, 6);
  document.getElementById('similarGrid').innerHTML = similar.map(c => `
    <a class="car-card" href="car-detail.html?id=${c.id}">
      <div class="car-media">
        <span class="car-badge">${c.badge}</span>
        <span class="car-fuel">${c.fuel}</span>
        <img src="${c.photo}" alt="${c.name}" loading="lazy" class="${c.aged ? 'img-aged' : ''}">
      </div>
      <div class="car-body">
        <h4>${c.name}</h4>
        <p class="car-meta">${c.year} · ${formatKm(c.km)} · ${c.fuel}</p>
        <div class="car-price-row">
          <span class="car-price">${formatPrice(c.price)}</span>
          <span class="car-emi">${formatEmi(c.emi)}</span>
        </div>
        <span class="car-cta">View Details</span>
      </div>
    </a>
  `).join('');

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
