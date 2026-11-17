// ============ SELL-CAR MULTI-STEP FLOW ============

// Fallback brand/model catalog + valuation/loan logic used when the backend
// API (admin/config.js -> API_BASE) is unreachable, so the page always works.
const FALLBACK_CATALOG = {
  'Maruti Suzuki': { basePrice: 650000, models: ['Alto K10', 'S-Presso', 'Celerio', 'WagonR', 'Swift', 'Baleno', 'Dzire', 'Ignis', 'Ertiga', 'XL6', 'Brezza', 'Grand Vitara', 'Fronx', 'Jimny', 'Eeco', 'Ciaz'] },
  Hyundai: { basePrice: 850000, models: ['Grand i10 Nios', 'i20', 'Aura', 'Venue', 'Creta', 'Verna', 'Alcazar', 'Exter', 'Tucson', 'Venue N Line'] },
  Tata: { basePrice: 800000, models: ['Tiago', 'Tigor', 'Altroz', 'Punch', 'Nexon', 'Harrier', 'Safari', 'Tigor EV', 'Nexon EV', 'Punch EV'] },
  Mahindra: { basePrice: 1150000, models: ['Bolero', 'Bolero Neo', 'XUV300', 'XUV400', 'Scorpio Classic', 'Scorpio-N', 'XUV700', 'Thar', 'Marazzo', 'KUV100'] },
  Honda: { basePrice: 950000, models: ['Amaze', 'City', 'City Hybrid', 'Elevate', 'WR-V', 'Jazz'] },
  Toyota: { basePrice: 1500000, models: ['Glanza', 'Urban Cruiser Taisor', 'Innova Crysta', 'Innova Hycross', 'Fortuner', 'Hilux', 'Camry', 'Hyryder', 'Rumion'] },
  Kia: { basePrice: 1050000, models: ['Sonet', 'Seltos', 'Carens', 'Carnival', 'EV6'] },
  MG: { basePrice: 1300000, models: ['Astor', 'Hector', 'Hector Plus', 'ZS EV', 'Comet EV', 'Gloster'] },
  Skoda: { basePrice: 1200000, models: ['Slavia', 'Kushaq', 'Octavia', 'Superb', 'Kodiaq'] },
  Volkswagen: { basePrice: 1150000, models: ['Virtus', 'Taigun', 'Tiguan', 'Vento', 'Polo'] },
  Renault: { basePrice: 600000, models: ['Kwid', 'Triber', 'Kiger'] },
  Nissan: { basePrice: 700000, models: ['Magnite', 'Kicks'] },
  Ford: { basePrice: 750000, models: ['EcoSport', 'Figo', 'Aspire', 'Endeavour', 'Freestyle'] },
  Jeep: { basePrice: 2000000, models: ['Compass', 'Meridian', 'Wrangler'] },
};

const CITY_TIER = { Mumbai: 1.04, 'Delhi NCR': 1.03, Bengaluru: 1.03, Hyderabad: 1.0, Pune: 1.0, Chennai: 0.99, Kolkata: 0.97 };

function fallbackValuation({ brand, year, km, fuel, owners = 1, city }) {
  const base = FALLBACK_CATALOG[brand]?.basePrice || 700000;
  const age = Math.max(0, new Date().getFullYear() - year);
  let depFactor = 1;
  for (let y = 1; y <= age; y++) depFactor *= y <= 1 ? 0.90 : y <= 3 ? 0.92 : 0.95;
  const expectedKm = age * 12000;
  const excessKm = Math.max(0, km - expectedKm);
  const kmPenalty = Math.max(0.55, 1 - (excessKm / 10000) * 0.02);
  const ownerPenalty = Math.max(0.85, 1 - (Math.max(1, owners) - 1) * 0.05);
  const fuelAdj = fuel === 'Electric' ? 1.05 : fuel === 'Diesel' ? 1.02 : fuel === 'CNG' ? 1.01 : 1;
  const cityAdj = CITY_TIER[city] || 1.0;
  let estimate = base * depFactor * kmPenalty * ownerPenalty * fuelAdj * cityAdj;
  estimate = Math.round(estimate / 1000) * 1000;
  estimate = Math.max(estimate, 40000);
  return { estimate, low: Math.round(estimate * 0.95 / 1000) * 1000, high: Math.round(estimate * 1.05 / 1000) * 1000 };
}

function fallbackLoanEligibility({ carPrice, monthlyIncome, existingEmis = 0, employmentType = 'salaried', creditScoreBand = '750+', tenureMonths = 60 }) {
  const loanRequired = carPrice;
  const foirCap = employmentType === 'salaried' ? 0.55 : 0.45;
  const affordableEmi = Math.max(0, monthlyIncome * foirCap - existingEmis);
  const rateTable = { '750+': 11.0, '700-749': 12.5, '650-699': 14.0, 'below-650': 16.5, 'no-history': 15.0 };
  const interestRate = rateTable[creditScoreBand] ?? 13.5;
  const r = interestRate / 12 / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  const maxLoanByEmi = affordableEmi > 0 ? Math.round((affordableEmi * (factor - 1)) / (r * factor)) : 0;
  const eligibleAmount = Math.max(0, Math.min(loanRequired, maxLoanByEmi));
  const emi = eligibleAmount > 0 ? Math.round((eligibleAmount * r * factor) / (factor - 1)) : 0;
  return { eligibleAmount, interestRate, emi, tenureMonths };
}

document.addEventListener('DOMContentLoaded', async () => {

  const apiBase = typeof API_BASE !== 'undefined' ? API_BASE : null;

  // --- Populate brand dropdown: full catalog from the backend, fallback to local list ---
  const brandSelect = document.getElementById('fBrand');
  let brandList = Object.keys(FALLBACK_CATALOG).sort();
  try {
    if (!apiBase) throw new Error('no api');
    const res = await fetch(`${apiBase}/valuation/catalog/brands`);
    if (!res.ok) throw new Error('api failed');
    const apiBrands = await res.json();
    if (Array.isArray(apiBrands) && apiBrands.length) brandList = apiBrands;
  } catch { /* use local fallback list */ }

  brandSelect.innerHTML = '<option value="">Select brand</option>' +
    brandList.map(b => `<option>${b}</option>`).join('');

  // --- Model dropdown depends on brand ---
  const modelSelect = document.getElementById('fModel');
  const modelOtherInput = document.getElementById('fModelOther');
  brandSelect.addEventListener('change', async () => {
    const brand = brandSelect.value;
    let models = FALLBACK_CATALOG[brand]?.models || [];
    try {
      if (!apiBase) throw new Error('no api');
      const res = await fetch(`${apiBase}/valuation/catalog/models/${encodeURIComponent(brand)}`);
      if (!res.ok) throw new Error('api failed');
      const apiModels = await res.json();
      if (Array.isArray(apiModels) && apiModels.length) models = apiModels;
    } catch { /* use local fallback list */ }
    modelSelect.innerHTML = '<option value="">Select model</option>' +
      models.map(m => `<option>${m}</option>`).join('') +
      '<option value="__other__">Other / not listed</option>';
  });
  modelSelect.addEventListener('change', () => {
    modelOtherInput.style.display = modelSelect.value === '__other__' ? 'block' : 'none';
  });

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
      field?.classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    });
    return valid;
  }

  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const current = btn.closest('.form-step');
      const currentN = +current.dataset.step;
      if (!validateStep(currentN)) return;

      if (currentN === 3) await buildQuote();
      goToStep(+btn.dataset.next);
    });
  });

  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => goToStep(+btn.dataset.back));
  });

  function getModelValue() {
    return modelSelect.value === '__other__' ? (modelOtherInput.value || 'Car') : (modelSelect.value || 'Car');
  }

  async function buildQuote() {
    const brand = brandSelect.value;
    const model = getModelValue();
    const year = +yearSelect.value;
    const km = +document.getElementById('fKm').value;
    const fuel = document.getElementById('fFuel').value;
    const owners = +document.getElementById('fOwners').value;
    const city = document.getElementById('fCity').value;

    let result;
    try {
      if (!apiBase) throw new Error('no api');
      const res = await fetch(`${apiBase}/valuation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, model, year, km, fuel, owners, city }),
      });
      if (!res.ok) throw new Error('api failed');
      result = await res.json();
    } catch {
      result = fallbackValuation({ brand, year, km, fuel, owners, city });
    }

    document.getElementById('quoteAmount').textContent = `₹ ${result.estimate.toLocaleString('en-IN')}`;
    document.getElementById('quoteRange').textContent = `Expected range: ₹ ${result.low.toLocaleString('en-IN')} – ₹ ${result.high.toLocaleString('en-IN')}`;
    document.getElementById('quoteCarName').textContent = `${brand} ${model} · ${year} · ${km.toLocaleString('en-IN')} km`;
    document.getElementById('quoteCityName').textContent = city || 'your city';
    window.__i4w_valuation = result.estimate;

    // Loan eligibility (optional step 3 inputs)
    const income = +document.getElementById('lIncome').value;
    const loanBox = document.getElementById('loanEligBox');
    if (income > 0) {
      const payload = {
        carPrice: result.estimate,
        monthlyIncome: income,
        existingEmis: +document.getElementById('lExistingEmi').value || 0,
        employmentType: document.getElementById('lEmployment').value,
        creditScoreBand: document.getElementById('lCreditBand').value,
      };
      let loan;
      try {
        if (!apiBase) throw new Error('no api');
        const res = await fetch(`${apiBase}/loan/eligibility`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('api failed');
        loan = await res.json();
      } catch {
        loan = fallbackLoanEligibility(payload);
      }
      loanBox.style.display = 'block';
      document.getElementById('loanEligText').innerHTML =
        `You're eligible for up to <strong>₹ ${loan.eligibleAmount.toLocaleString('en-IN')}</strong> at ` +
        `<strong>${loan.interestRate}%</strong> interest — EMI from <strong>₹ ${loan.emi.toLocaleString('en-IN')}/mo</strong> over ${loan.tenureMonths} months.`;
      window.__i4w_loanIncome = income;
    } else {
      loanBox.style.display = 'none';
    }
  }

  document.getElementById('sellForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('fName').value || 'there';
    const submitBtn = e.submitter;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Booking...'; }

    const payload = {
      name,
      phone: document.getElementById('fPhone').value,
      email: document.getElementById('fEmail').value,
      city: document.getElementById('fCity').value,
      brand: brandSelect.value,
      model: getModelValue(),
      year: +yearSelect.value,
      km: +document.getElementById('fKm').value,
      fuel: document.getElementById('fFuel').value,
      owners: +document.getElementById('fOwners').value,
      monthlyIncome: window.__i4w_loanIncome || undefined,
    };

    try {
      if (apiBase) {
        await fetch(`${apiBase}/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch {
      // Backend unreachable — still show confirmation; lead simply isn't saved server-side.
    }

    document.getElementById('confirmMsg').textContent =
      `Thanks ${name}! We'll call you within 30 minutes to schedule a free inspection at your location.`;
    goToStep(5);
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
