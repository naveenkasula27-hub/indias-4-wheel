// ============ SELL-CAR MULTI-STEP FLOW ============

// Fallback brand/model catalog + valuation/loan logic used when the backend
// API (admin/config.js -> API_BASE) is unreachable, so the page always works.
const FALLBACK_CATALOG = {
  'Maruti Suzuki': { models: { 'Alto K10': 450000, 'S-Presso': 480000, Celerio: 550000, WagonR: 550000, Swift: 670000, Baleno: 720000, Dzire: 700000, Ignis: 650000, Ertiga: 950000, XL6: 1150000, Brezza: 1100000, 'Grand Vitara': 1300000, Fronx: 850000, Jimny: 1350000, Eeco: 500000, Ciaz: 950000 } },
  Hyundai: { models: { 'Grand i10 Nios': 600000, i20: 700000, Aura: 700000, Venue: 900000, Creta: 1200000, Verna: 1050000, Alcazar: 1600000, Exter: 750000, Tucson: 2700000, 'Venue N Line': 1150000 } },
  Tata: { models: { Tiago: 580000, Tigor: 700000, Altroz: 720000, Punch: 620000, Nexon: 950000, Harrier: 1600000, Safari: 1800000, 'Tigor EV': 1300000, 'Nexon EV': 1500000, 'Punch EV': 1100000 } },
  Mahindra: { models: { Bolero: 950000, 'Bolero Neo': 1000000, XUV300: 750000, XUV400: 1700000, 'Scorpio Classic': 1400000, 'Scorpio-N': 1600000, XUV700: 2000000, Thar: 1350000, Marazzo: 1400000, KUV100: 550000 } },
  Honda: { resaleTier: 'weak', models: { Amaze: 680000, City: 1120000, 'City Hybrid': 1900000, Elevate: 1300000, 'WR-V': 780000, Jazz: 900000 } },
  Toyota: { models: { Glanza: 720000, 'Urban Cruiser Taisor': 780000, 'Innova Crysta': 2000000, 'Innova Hycross': 2200000, Fortuner: 3600000, Hilux: 3800000, Camry: 4500000, Hyryder: 1400000, Rumion: 950000 } },
  Kia: { models: { Sonet: 900000, Seltos: 1250000, Carens: 1300000, Carnival: 3200000, EV6: 6500000 } },
  MG: { models: { Astor: 1250000, Hector: 1450000, 'Hector Plus': 1450000, 'ZS EV': 2200000, 'Comet EV': 850000, Gloster: 3700000 } },
  Skoda: { resaleTier: 'weak', models: { Slavia: 1150000, Kushaq: 1150000, Octavia: 1500000, Superb: 2200000, Kodiaq: 2600000 } },
  Volkswagen: { resaleTier: 'weak', models: { Virtus: 1050000, Taigun: 1150000, Tiguan: 3900000, Vento: 850000, Polo: 750000 } },
  Renault: { models: { Kwid: 450000, Triber: 650000, Kiger: 700000 } },
  Nissan: { resaleTier: 'weak', models: { Magnite: 650000, Kicks: 1100000 } },
  Ford: { resaleTier: 'weak', models: { EcoSport: 850000, Figo: 550000, Aspire: 500000, Endeavour: 3400000, Freestyle: 550000 } },
  Jeep: { luxury: true, models: { Compass: 2100000, Meridian: 3200000, Wrangler: 7000000 } },
};

const CITY_TIER = { Mumbai: 1.04, 'Delhi NCR': 1.03, Bengaluru: 1.03, Hyderabad: 1.0, Pune: 1.0, Chennai: 0.99, Kolkata: 0.97 };

const LUXURY_BRANDS = ['Mercedes-Benz', 'BMW', 'Audi', 'Volvo', 'Jeep', 'Land Rover', 'MINI'];

const MIDSIZE_MODELS = new Set([
  'Hyundai::Creta', 'Hyundai::Verna', 'Hyundai::Alcazar', 'Hyundai::Tucson',
  'Maruti Suzuki::Ciaz', 'Maruti Suzuki::Ertiga', 'Maruti Suzuki::XL6',
  'Maruti Suzuki::Brezza', 'Maruti Suzuki::Grand Vitara',
  'Tata::Nexon', 'Tata::Harrier', 'Tata::Safari', 'Tata::Nexon EV',
  'Kia::Seltos', 'Kia::Carens', 'Kia::Carnival',
]);

const VARIANT_MULTIPLIERS = [0.87, 0.97, 1.08, 1.20];
const VARIANT_NAMES_BY_BRAND = {
  'Maruti Suzuki': ['LXI', 'VXI', 'ZXI', 'ZXI+'],
  Hyundai: ['E', 'EX', 'S', 'SX(O)'],
  Tata: ['XE', 'XM', 'XZ', 'XZ+'],
  Honda: ['SV', 'V', 'VX', 'ZX'],
  Kia: ['HTE', 'HTK', 'HTX', 'GTX'],
};
const GENERIC_VARIANT_NAMES = ['Base', 'Mid', 'High', 'Top'];

// Display-only on-road premium (road tax + insurance + registration,
// blended into one figure) — never applied to the actual valuation math,
// only to what's shown next to each variant so it reads as a real
// purchase price. Tiered by price since road tax is progressive in most
// states (checked real listings: ~12.6% for a Swift, ~19.5% for a
// Fortuner) — see brandCatalog.js's onRoadMultiplier for the real data.
function onRoadMultiplier(exShowroomPrice) {
  if (exShowroomPrice < 1000000) return 1.12;
  if (exShowroomPrice < 2500000) return 1.15;
  return 1.19;
}

function fallbackListVariants(brand, model) {
  const basePrice = fallbackBasePrice(brand, model);
  const names = VARIANT_NAMES_BY_BRAND[brand] || GENERIC_VARIANT_NAMES;
  return names.map((name, i) => {
    const exShowroom = basePrice * VARIANT_MULTIPLIERS[i];
    return { name, price: Math.round(exShowroom * onRoadMultiplier(exShowroom) / 1000) * 1000 };
  });
}

function fallbackVariantMultiplier(brand, variant) {
  const names = VARIANT_NAMES_BY_BRAND[brand] || GENERIC_VARIANT_NAMES;
  const i = names.indexOf(variant);
  return i >= 0 ? VARIANT_MULTIPLIERS[i] : 1;
}

function fallbackBasePrice(brand, model) {
  const entry = FALLBACK_CATALOG[brand];
  if (!entry) return 500000;
  if (model && entry.models[model] != null) return entry.models[model];
  const prices = Object.values(entry.models);
  return prices.length ? Math.min(...prices) : 500000;
}

function fallbackValuation({ brand, model, variant, year, km, fuel, owners = 1, city }) {
  let base = fallbackBasePrice(brand, model);
  if (variant) base = Math.round(base * fallbackVariantMultiplier(brand, variant) / 1000) * 1000;
  const age = Math.max(0, new Date().getFullYear() - year);
  const tier = LUXURY_BRANDS.includes(brand) ? 'luxury'
    : FALLBACK_CATALOG[brand]?.resaleTier === 'weak' ? 'weak'
    : MIDSIZE_MODELS.has(`${brand}::${model}`) ? 'midsize'
    : 'standard';
  let depFactor = 1;
  for (let y = 1; y <= age; y++) {
    depFactor *= tier === 'luxury'
      ? (y <= 1 ? 0.75 : y <= 3 ? 0.82 : 0.85)
      : tier === 'weak'
      ? (y <= 1 ? 0.83 : y <= 3 ? 0.86 : 0.91)
      : tier === 'midsize'
      ? (y <= 1 ? 0.86 : y <= 3 ? 0.89 : 0.91)
      : (y <= 1 ? 0.90 : y <= 3 ? 0.92 : 0.95);
  }
  const expectedKm = age * 12000;
  const kmRatio = expectedKm > 0 ? km / expectedKm : 1;
  let kmPenalty;
  if (kmRatio < 1) {
    const underrun = Math.min(1, 1 - kmRatio);
    kmPenalty = 1 + underrun * 0.10;
  } else {
    const excessKm = km - expectedKm;
    kmPenalty = Math.max(0.55, 1 - (excessKm / 10000) * 0.02);
  }
  const ownerPenalty = owners <= 1 ? 1.03 : Math.max(0.85, 1 - (owners - 1) * 0.05);
  const fuelAdj = fuel === 'Electric' ? 1.05 : fuel === 'Diesel' ? 1.02 : fuel === 'CNG' ? 1.01 : 1;
  const cityAdj = CITY_TIER[city] || 1.0;
  let estimate = base * depFactor * kmPenalty * ownerPenalty * fuelAdj * cityAdj;
  estimate = Math.min(estimate, base);
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
    const requestedBrand = brand;
    let models = Object.keys(FALLBACK_CATALOG[brand]?.models || {});
    modelSelect.innerHTML = '<option value="">Loading models...</option>';
    try {
      if (!apiBase) throw new Error('no api');
      const res = await fetch(`${apiBase}/valuation/catalog/models/${encodeURIComponent(brand)}`);
      if (!res.ok) throw new Error('api failed');
      const apiModels = await res.json();
      if (Array.isArray(apiModels) && apiModels.length) models = apiModels;
    } catch { /* use local fallback list */ }
    // If the brand changed again while this fetch was in flight, a newer
    // call already owns the dropdown — don't overwrite it with stale data.
    if (brandSelect.value !== requestedBrand) return;
    modelSelect.innerHTML = '<option value="">Select model</option>' +
      models.map(m => `<option>${m}</option>`).join('') +
      '<option value="__other__">Other / not listed</option>';
    variantSelect.innerHTML = '<option value="">Select model first</option>';
  });
  modelSelect.addEventListener('change', () => {
    modelOtherInput.style.display = modelSelect.value === '__other__' ? 'block' : 'none';
  });

  // --- Variant dropdown depends on brand + model ---
  const variantSelect = document.getElementById('fVariant');
  modelSelect.addEventListener('change', async () => {
    const brand = brandSelect.value;
    const model = modelSelect.value;
    if (!model || model === '__other__') {
      variantSelect.innerHTML = '<option value="">No variant needed</option>';
      return;
    }
    const requestedKey = `${brand}::${model}`;
    let variants = fallbackListVariants(brand, model);
    variantSelect.innerHTML = '<option value="">Loading variants...</option>';
    try {
      if (!apiBase) throw new Error('no api');
      const res = await fetch(`${apiBase}/valuation/catalog/variants/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`);
      if (!res.ok) throw new Error('api failed');
      const apiVariants = await res.json();
      if (Array.isArray(apiVariants) && apiVariants.length) variants = apiVariants;
    } catch { /* use local fallback list */ }
    if (`${brandSelect.value}::${modelSelect.value}` !== requestedKey) return;
    variantSelect.innerHTML = '<option value="">Select variant (optional)</option>' +
      variants.map(v => `<option value="${v.name}">${v.name} · ₹${v.price.toLocaleString('en-IN')}</option>`).join('');
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

      if (currentN === 2) await buildQuote();
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
    const variant = variantSelect.value;
    const owners = +document.getElementById('fOwners').value;
    const city = document.getElementById('fCity').value;

    let result;
    try {
      if (!apiBase) throw new Error('no api');
      const res = await fetch(`${apiBase}/valuation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, model, variant, year, km, fuel, owners, city }),
      });
      if (!res.ok) throw new Error('api failed');
      result = await res.json();
    } catch {
      result = fallbackValuation({ brand, model, variant, year, km, fuel, owners, city });
    }

    document.getElementById('quoteAmount').textContent = `₹ ${result.estimate.toLocaleString('en-IN')}`;
    document.getElementById('quoteRange').textContent = `Expected range: ₹ ${result.low.toLocaleString('en-IN')} – ₹ ${result.high.toLocaleString('en-IN')}`;
    document.getElementById('quoteCarName').textContent = `${brand} ${model}${variant ? ' ' + variant : ''} · ${year} · ${km.toLocaleString('en-IN')} km`;
    document.getElementById('quoteCityName').textContent = city || 'your city';
    window.__i4w_valuation = result.estimate;
  }

  // Optional loan eligibility check — collapsible on the quote screen, not a forced step
  document.getElementById('toggleLoanCheck')?.addEventListener('click', () => {
    const panel = document.getElementById('loanCheckPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('checkLoanBtn')?.addEventListener('click', async () => {
    const income = +document.getElementById('lIncome').value;
    const loanBox = document.getElementById('loanEligBox');
    if (!income) { alert('Enter your monthly income first.'); return; }

    const payload = {
      carPrice: window.__i4w_valuation || 0,
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
  });

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
      variant: variantSelect.value,
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
