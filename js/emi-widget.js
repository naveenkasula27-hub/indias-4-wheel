// ============ SHARED EMI CALCULATOR WIDGET ============
// Used by the homepage (homeEmi + quickEmi widgets) and the standalone
// emi-calculator.html page. Kept separate from script.js so the
// standalone page doesn't need to load cars-data.js (and its API
// fetch for the car listings) just to render an EMI number.

function emiFormatPrice(n) {
  return n >= 100000 ? `₹ ${(n / 100000).toFixed(1)} Lakh` : `₹ ${n.toLocaleString('en-IN')}`;
}

function computeEmi(principal, annualRatePct, tenureMonths) {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return Math.round(principal / tenureMonths);
  const factor = Math.pow(1 + r, tenureMonths);
  return Math.round((principal * r * factor) / (factor - 1));
}

// One EMI widget = 4 slider+number pairs (price, down, rate, tenure) with
// a given id prefix (e.g. "homeEmi" -> homeEmiPriceSlider/homeEmiPriceInput).
// The number inputs are always the source of truth for computation — a
// native range input silently snaps its own .value to the nearest `step`
// even when set from JS, so reading from the sliders would quietly round
// away whatever exact number was typed (e.g. ₹12,34,000 becoming ₹12,50,000).
function setupEmiWidget(prefix) {
  const price = document.getElementById(`${prefix}PriceSlider`);
  if (!price) return;
  const down = document.getElementById(`${prefix}DownSlider`);
  const rate = document.getElementById(`${prefix}RateSlider`);
  const tenure = document.getElementById(`${prefix}TenureSlider`);
  const priceInput = document.getElementById(`${prefix}PriceInput`);
  const downInput = document.getElementById(`${prefix}DownInput`);
  const rateInput = document.getElementById(`${prefix}RateInput`);
  const tenureInput = document.getElementById(`${prefix}TenureInput`);

  function update() {
    const p = +priceInput.value || 0;
    const downAmount = Math.min(+downInput.value || 0, p);
    const r = +rateInput.value || 0;
    const t = +tenureInput.value || 0;
    const downPct = p > 0 ? Math.round((downAmount / p) * 100) : 0;
    const emi = computeEmi(Math.max(0, p - downAmount), r, t);

    document.getElementById(`${prefix}PriceLabel`).textContent = emiFormatPrice(p);
    document.getElementById(`${prefix}DownLabel`).textContent = `${downPct}% · ${emiFormatPrice(downAmount)}`;
    document.getElementById(`${prefix}RateLabel`).textContent = `${r}%`;
    document.getElementById(`${prefix}TenureLabel`).textContent = `${t} months`;
    document.getElementById(`${prefix}Monthly`).textContent = `₹${emi.toLocaleString('en-IN')}`;
  }

  // Slider moved -> sync its paired number input, then recompute.
  price.addEventListener('input', () => { priceInput.value = price.value; update(); });
  down.addEventListener('input', () => { downInput.value = Math.round(+price.value * (+down.value / 100)); update(); });
  rate.addEventListener('input', () => { rateInput.value = rate.value; update(); });
  tenure.addEventListener('input', () => { tenureInput.value = tenure.value; update(); });

  // Number typed -> sync its paired slider (clamped to range), then recompute.
  priceInput.addEventListener('input', () => {
    price.value = Math.min(+price.max, Math.max(+price.min, +priceInput.value || 0));
    update();
  });
  downInput.addEventListener('input', () => {
    const p = +price.value || 1;
    down.value = Math.min(80, Math.max(0, Math.round(((+downInput.value || 0) / p) * 100)));
    update();
  });
  rateInput.addEventListener('input', () => {
    rate.value = Math.min(+rate.max, Math.max(+rate.min, +rateInput.value || 0));
    update();
  });
  tenureInput.addEventListener('input', () => {
    tenure.value = Math.min(+tenure.max, Math.max(+tenure.min, +tenureInput.value || 0));
    update();
  });

  update();
}
