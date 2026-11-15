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
    loadCars().then(cars => {
      carGrid.innerHTML = cars.slice(0, 8).map(c => `
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
    });
  }

  /* ---------- Homepage EMI calculator (interactive) ---------- */
  const hPrice = document.getElementById('homeEmiPriceSlider');
  const hDown = document.getElementById('homeEmiDownSlider');
  const hRate = document.getElementById('homeEmiRateSlider');
  const hTenure = document.getElementById('homeEmiTenureSlider');
  function computeEmi(principal, annualRatePct, tenureMonths) {
    const r = annualRatePct / 12 / 100;
    if (r === 0) return Math.round(principal / tenureMonths);
    const factor = Math.pow(1 + r, tenureMonths);
    return Math.round((principal * r * factor) / (factor - 1));
  }
  function updateHomeEmi() {
    if (!hPrice) return;
    const price = +hPrice.value;
    const downPct = +hDown.value;
    const rate = +hRate.value;
    const tenure = +hTenure.value;
    const downAmount = Math.round(price * (downPct / 100));
    const emi = computeEmi(price - downAmount, rate, tenure);
    document.getElementById('homeEmiPriceLabel').textContent = formatPrice(price);
    document.getElementById('homeEmiDownLabel').textContent = `${downPct}% · ${formatPrice(downAmount)}`;
    document.getElementById('homeEmiRateLabel').textContent = `${rate}%`;
    document.getElementById('homeEmiTenureLabel').textContent = `${tenure} months`;
    document.getElementById('homeEmiMonthly').textContent = `₹${emi.toLocaleString('en-IN')}`;
  }
  [hPrice, hDown, hRate, hTenure].forEach(el => el?.addEventListener('input', updateHomeEmi));
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
