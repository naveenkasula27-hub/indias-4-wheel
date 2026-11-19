// ============ INDIA'S 4 WHEEL — SITE SCRIPT ============

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Hero search button -> inventory page ---------- */
  document.querySelector('.search-panel[data-panel="buy"] .search-btn')?.addEventListener('click', () => {
    window.location.href = 'inventory.html';
  });

  /* ---------- Buy / Sell tabs ---------- */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.search-panel');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`.search-panel[data-panel="${btn.dataset.tab}"]`).classList.add('active');
    });
  });

  /* ---------- Hero background carousel ---------- */
  const slides = document.querySelectorAll('.hero-slide');
  let slideIndex = 0;
  if (slides.length) {
    setInterval(() => {
      slides[slideIndex].classList.remove('active');
      slideIndex = (slideIndex + 1) % slides.length;
      slides[slideIndex].classList.add('active');
    }, 5000);
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('.counter');
  const animateCounter = (el) => {
    const target = +el.dataset.target;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('en-IN') + (el.closest('.stat')?.querySelector('small')?.textContent.includes('%') ? '' : '+');
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Scroll reveal for fade-up elements inside sections ---------- */
  const revealEls = document.querySelectorAll('main .fade-up');
  revealEls.forEach(el => el.classList.add('scroll-reveal'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Build car inventory cards (live from owner dashboard, real photos) ---------- */
  const carGrid = document.getElementById('carGrid');
  if (carGrid && typeof loadCars === 'function') {
    carGrid.innerHTML = Array.from({ length: 4 }).map(() => '<div class="car-card skeleton-card"><div class="car-media"></div><div class="car-body"><div class="skeleton-line" style="width:70%"></div><div class="skeleton-line" style="width:50%"></div></div></div>').join('');
    loadCars().then(cars => {
      carGrid.innerHTML = cars.slice(0, 8).map(c => `
        <a class="car-card" href="car-detail.html?id=${c.id}">
          <div class="car-media">
            <button class="save-car-btn" data-car-id="${c.id}" aria-label="Save car">♡</button>
            <span class="car-badge">${c.verified ? '✓ Verified' : c.badge}</span>
            <span class="car-fuel">${c.fuel}</span>
            <img src="${c.photo}" alt="${c.name}" loading="lazy" class="${c.aged ? 'img-aged' : ''}">
          </div>
          <div class="car-body">
            <h4>${c.name}</h4>
            <p class="car-meta">${c.year} · ${formatKm(c.km)} · ${c.fuel} · ${c.owners === 1 ? '1st Owner' : c.owners + ' Owners'}</p>
            <div class="car-price-row">
              <span class="car-price">${formatPrice(c.price)}</span>
              <span class="car-emi">${formatEmi(c.emi)}</span>
            </div>
            <span class="car-cta">View Details</span>
          </div>
        </a>
      `).join('');
      window.i4wInitSaveButtons?.(carGrid);
    });
  }

  /* ---------- Budget tiles + "starts at" model cards ---------- */
  if (typeof loadCars === 'function' && (document.getElementById('budgetGrid') || document.getElementById('modelStartsGrid'))) {
    loadCars().then(cars => {
      // Budget tile counts
      document.querySelectorAll('.budget-count').forEach(el => {
        const min = +el.dataset.min || 0;
        const max = el.dataset.max ? +el.dataset.max : Infinity;
        const count = cars.filter(c => c.price >= min && c.price < max).length;
        el.textContent = `${count} ${count === 1 ? 'Car' : 'Cars'}`;
      });

      // "Starts at" model cards: group by model name, keep the cheapest of each
      const modelsGrid = document.getElementById('modelStartsGrid');
      if (!modelsGrid) return;

      function renderModels(bodyFilter) {
        const byModel = new Map();
        cars.forEach(c => {
          if (bodyFilter && c.bodyType !== bodyFilter) return;
          const key = c.model || c.name;
          const existing = byModel.get(key);
          if (!existing || c.price < existing.price) byModel.set(key, c);
        });
        const list = [...byModel.values()].sort((a, b) => a.price - b.price).slice(0, 8);
        modelsGrid.innerHTML = list.map(c => `
          <a class="model-start-card" href="inventory.html?model=${encodeURIComponent(c.model || c.name)}">
            <img src="${c.photo}" alt="${c.model || c.name}" loading="lazy">
            <div class="msc-body">
              <h4>${c.model || c.name}</h4>
              <p class="msc-price">Starts at <strong>${formatPrice(c.price)}</strong></p>
            </div>
          </a>
        `).join('') || '<p style="color:var(--slate-light);">No cars in this category yet.</p>';
      }
      renderModels('');

      document.querySelectorAll('#modelBodyPills .pill').forEach(pill => {
        pill.addEventListener('click', () => {
          document.querySelectorAll('#modelBodyPills .pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          renderModels(pill.dataset.body);
        });
      });
    });
  }

  /* ---------- Homepage EMI calculator (interactive — slider or typed) ---------- */
  const hPrice = document.getElementById('homeEmiPriceSlider');
  const hDown = document.getElementById('homeEmiDownSlider');
  const hRate = document.getElementById('homeEmiRateSlider');
  const hTenure = document.getElementById('homeEmiTenureSlider');
  const hPriceInput = document.getElementById('homeEmiPriceInput');
  const hDownInput = document.getElementById('homeEmiDownInput');
  const hRateInput = document.getElementById('homeEmiRateInput');
  const hTenureInput = document.getElementById('homeEmiTenureInput');

  function computeEmi(principal, annualRatePct, tenureMonths) {
    const r = annualRatePct / 12 / 100;
    if (r === 0) return Math.round(principal / tenureMonths);
    const factor = Math.pow(1 + r, tenureMonths);
    return Math.round((principal * r * factor) / (factor - 1));
  }

  // Down payment is kept in ₹ (typed exactly) with the slider showing the
  // nearest round % equivalent for a quick visual, instead of the other
  // way around — typing "1,70,000" should always win over a 5%-step drag.
  function updateHomeEmi() {
    if (!hPrice) return;
    const price = +hPrice.value;
    const downAmount = Math.min(+hDownInput.value || 0, price);
    const rate = +hRate.value;
    const tenure = +hTenure.value;
    const downPct = price > 0 ? Math.round((downAmount / price) * 100) : 0;
    const emi = computeEmi(Math.max(0, price - downAmount), rate, tenure);

    document.getElementById('homeEmiPriceLabel').textContent = formatPrice(price);
    document.getElementById('homeEmiDownLabel').textContent = `${downPct}% · ${formatPrice(downAmount)}`;
    document.getElementById('homeEmiRateLabel').textContent = `${rate}%`;
    document.getElementById('homeEmiTenureLabel').textContent = `${tenure} months`;
    document.getElementById('homeEmiMonthly').textContent = `₹${emi.toLocaleString('en-IN')}`;
  }

  // Slider moved -> sync its paired number input, then recompute.
  hPrice?.addEventListener('input', () => { hPriceInput.value = hPrice.value; updateHomeEmi(); });
  hDown?.addEventListener('input', () => { hDownInput.value = Math.round(+hPrice.value * (+hDown.value / 100)); updateHomeEmi(); });
  hRate?.addEventListener('input', () => { hRateInput.value = hRate.value; updateHomeEmi(); });
  hTenure?.addEventListener('input', () => { hTenureInput.value = hTenure.value; updateHomeEmi(); });

  // Number typed -> sync its paired slider (clamped to the slider's range), then recompute.
  hPriceInput?.addEventListener('input', () => {
    const v = +hPriceInput.value || 0;
    hPrice.value = Math.min(+hPrice.max, Math.max(+hPrice.min, v));
    updateHomeEmi();
  });
  hDownInput?.addEventListener('input', () => {
    const price = +hPrice.value || 1;
    const pct = Math.min(80, Math.max(0, Math.round(((+hDownInput.value || 0) / price) * 100)));
    hDown.value = pct;
    updateHomeEmi();
  });
  hRateInput?.addEventListener('input', () => {
    const v = +hRateInput.value || 0;
    hRate.value = Math.min(+hRate.max, Math.max(+hRate.min, v));
    updateHomeEmi();
  });
  hTenureInput?.addEventListener('input', () => {
    const v = +hTenureInput.value || 0;
    hTenure.value = Math.min(+hTenure.max, Math.max(+hTenure.min, v));
    updateHomeEmi();
  });

  updateHomeEmi();

  /* ---------- Generic horizontal-scroll arrow buttons ---------- */
  document.querySelectorAll('.car-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const track = document.getElementById(btn.dataset.target);
      if (track) track.scrollBy({ left: btn.dataset.dir === '1' ? 320 : -320, behavior: 'smooth' });
    });
  });

  /* ---------- Testimonial carousel ---------- */
  const testiTrack = document.getElementById('testiTrack');
  document.getElementById('testiPrev')?.addEventListener('click', () => testiTrack.scrollBy({ left: -342, behavior: 'smooth' }));
  document.getElementById('testiNext')?.addEventListener('click', () => testiTrack.scrollBy({ left: 342, behavior: 'smooth' }));

  /* auto-scroll testimonials gently */
  let autoDir = 1;
  if (testiTrack) {
    setInterval(() => {
      if (!testiTrack) return;
      const maxScroll = testiTrack.scrollWidth - testiTrack.clientWidth;
      if (testiTrack.scrollLeft >= maxScroll - 5) autoDir = -1;
      if (testiTrack.scrollLeft <= 5) autoDir = 1;
      testiTrack.scrollBy({ left: autoDir * 1.2, behavior: 'auto' });
    }, 30);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.acc-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.closest('.acc-item');
      const wasActive = item.classList.contains('active');
      document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });

  /* ---------- Filter chips (visual only) ---------- */
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
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
