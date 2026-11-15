// ============ SELL-CAR MULTI-STEP FLOW ============

document.addEventListener('DOMContentLoaded', () => {

  // Populate year dropdown
  const yearSelect = document.getElementById('fYear');
  const thisYear = new Date().getFullYear();
  for (let y = thisYear; y >= thisYear - 17; y--) {
    const opt = document.createElement('option');
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }

  const steps = document.querySelectorAll('.form-step');
  const progressSteps = document.querySelectorAll('.progress-step');

  function goToStep(n) {
    steps.forEach(s => s.classList.toggle('active', +s.dataset.step === n));
    progressSteps.forEach(p => {
      const step = +p.dataset.step;
      p.classList.toggle('active', step === n);
      p.classList.toggle('done', step < n);
    });
    document.querySelector('.sell-form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validateStep(n) {
    const stepEl = document.querySelector(`.form-step[data-step="${n}"]`);
    const inputs = stepEl.querySelectorAll('input[required], select[required]');
    let valid = true;
    inputs.forEach(input => {
      const field = input.closest('.field');
      const ok = input.checkValidity() && input.value.trim() !== '';
      field.classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    });
    return valid;
  }

  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = btn.closest('.form-step');
      const currentN = +current.dataset.step;
      if (!validateStep(currentN)) return;

      if (currentN === 2) buildQuote();
      goToStep(+btn.dataset.next);
    });
  });

  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => goToStep(+btn.dataset.back));
  });

  // Base-value table per brand (₹, rough new-car reference) used for the fake instant-quote estimate
  const BASE_VALUE = {
    'Maruti Suzuki': 700000, 'Hyundai': 950000, 'Tata': 850000, 'Honda': 1000000,
    'Mahindra': 1300000, 'Kia': 1150000, 'Toyota': 1800000, 'MG': 1400000,
  };

  function buildQuote() {
    const brand = document.getElementById('fBrand').value;
    const model = document.getElementById('fModel').value || 'Car';
    const year = +document.getElementById('fYear').value;
    const km = +document.getElementById('fKm').value;
    const fuel = document.getElementById('fFuel').value;
    const city = document.getElementById('fCity').value;

    const base = BASE_VALUE[brand] || 700000;
    const age = Math.max(0, new Date().getFullYear() - year);
    const ageDepreciation = Math.pow(0.88, age); // ~12% per year
    const kmPenalty = Math.max(0.55, 1 - (km / 20000) * 0.03); // small reduction per 20k km
    const fuelAdj = fuel === 'Electric' ? 1.05 : fuel === 'Diesel' ? 1.02 : 1;

    let estimate = base * ageDepreciation * kmPenalty * fuelAdj;
    estimate = Math.round(estimate / 1000) * 1000;
    estimate = Math.max(estimate, 40000);

    document.getElementById('quoteAmount').textContent = `₹ ${estimate.toLocaleString('en-IN')}`;
    document.getElementById('quoteCarName').textContent = `${brand} ${model} · ${year} · ${km.toLocaleString('en-IN')} km`;
    document.getElementById('quoteCityName').textContent = city || 'your city';
  }

  document.getElementById('sellForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fName').value || 'there';
    document.getElementById('confirmMsg').textContent =
      `Thanks ${name}! We'll call you within 30 minutes to schedule a free inspection at your location.`;
    goToStep(4);
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
