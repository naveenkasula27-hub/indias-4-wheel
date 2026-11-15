// ============ CAR DETAIL PAGE ============

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const CARS = await loadCars();
  const car = CARS.find(c => c.id === params.get('id')) || CARS[0];

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

  // EMI calculator — down payment %, interest rate, and tenure are all adjustable
  document.getElementById('emiPrice').textContent = formatPrice(car.price);
  const downSlider = document.getElementById('emiDownSlider');
  const rateSlider = document.getElementById('emiRateSlider');
  const tenureSlider = document.getElementById('emiTenureSlider');

  function computeEmi(principal, annualRatePct, tenureMonths) {
    const r = annualRatePct / 12 / 100;
    if (r === 0) return Math.round(principal / tenureMonths);
    const factor = Math.pow(1 + r, tenureMonths);
    return Math.round((principal * r * factor) / (factor - 1));
  }

  function updateEmi() {
    const downPct = +downSlider.value;
    const rate = +rateSlider.value;
    const tenure = +tenureSlider.value;
    const downAmount = Math.round(car.price * (downPct / 100));
    const loanAmount = car.price - downAmount;
    const emi = computeEmi(loanAmount, rate, tenure);

    document.getElementById('emiDownLabel').textContent = `${downPct}% · ${formatPrice(downAmount)}`;
    document.getElementById('emiRateLabel').textContent = `${rate}%`;
    document.getElementById('emiTenureLabel').textContent = `${tenure} months`;
    document.getElementById('emiMonthly').textContent = `₹${emi.toLocaleString('en-IN')}`;
  }
  [downSlider, rateSlider, tenureSlider].forEach(el => el?.addEventListener('input', updateEmi));
  updateEmi();

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

  // --- Get Loan Offer: prefill the standalone loan page with this car's price ---
  const loanLink = document.getElementById('getLoanOfferLink');
  if (loanLink) loanLink.href = `loan.html?price=${car.price}`;

  // --- Save car (requires customer login) ---
  const apiBase = typeof API_BASE !== 'undefined' ? API_BASE : null;
  const customerToken = localStorage.getItem('i4w_customer_token');
  const saveBtn = document.getElementById('saveCarBtn');
  let saved = false;

  async function refreshSavedState() {
    if (!customerToken || !apiBase) return;
    try {
      const res = await fetch(`${apiBase}/customer/me`, { headers: { Authorization: `Bearer ${customerToken}` } });
      if (!res.ok) return;
      const data = await res.json();
      saved = data.savedCars.some((c) => c._id === car.id);
      saveBtn.textContent = saved ? '♥ Saved' : '♡ Save';
      saveBtn.classList.toggle('active', saved);
    } catch { /* ignore */ }
  }
  refreshSavedState();

  saveBtn?.addEventListener('click', async () => {
    if (!customerToken) {
      window.location.href = 'account.html';
      return;
    }
    const method = saved ? 'DELETE' : 'POST';
    await fetch(`${apiBase}/customer/saved-cars/${car.id}`, { method, headers: { Authorization: `Bearer ${customerToken}` } });
    saved = !saved;
    saveBtn.textContent = saved ? '♥ Saved' : '♡ Save';
    saveBtn.classList.toggle('active', saved);
  });

  // --- Share car ---
  document.getElementById('shareCarBtn')?.addEventListener('click', async () => {
    const shareData = { title: car.name, text: `Check out this ${car.name} on India's 4 Wheel — ${formatPrice(car.price)}`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareData.text}\n${shareData.url}`)}`;
      window.open(waUrl, '_blank');
    }
  });

  // --- Book Test Drive modal ---
  const tdModal = document.getElementById('testDriveModal');
  document.getElementById('bookTestDriveBtn')?.addEventListener('click', () => {
    document.getElementById('tdCarName').textContent = car.name;
    document.getElementById('tdMsg').textContent = '';
    tdModal.style.display = 'flex';
  });
  document.getElementById('closeTdModal')?.addEventListener('click', () => { tdModal.style.display = 'none'; });
  tdModal?.addEventListener('click', (e) => { if (e.target === tdModal) tdModal.style.display = 'none'; });

  document.getElementById('tdSubmitBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('tdName').value.trim();
    const phone = document.getElementById('tdPhone').value.trim();
    const msg = document.getElementById('tdMsg');
    if (!name || !/^\d{10}$/.test(phone)) {
      msg.style.color = '#e14343';
      msg.textContent = 'Enter your name and a valid 10-digit mobile number.';
      return;
    }
    try {
      if (!apiBase) throw new Error('offline');
      await fetch(`${apiBase}/test-drives`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, carId: car.id, carName: car.name }),
      });
    } catch { /* request still confirmed to the user even if the backend is unreachable */ }
    msg.style.color = 'var(--emerald)';
    msg.textContent = `Thanks ${name}! We'll call you shortly to schedule your test drive.`;
    setTimeout(() => { tdModal.style.display = 'none'; }, 1800);
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
