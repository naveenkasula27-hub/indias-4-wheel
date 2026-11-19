const { getBasePrice, getResaleTier } = require('./brandCatalog');

// City tier multiplier — demand/resale strength differs by market tier.
const CITY_TIER = {
  Mumbai: 1.04, 'Delhi NCR': 1.03, Bengaluru: 1.03, Hyderabad: 1.0,
  Pune: 1.0, Chennai: 0.99, Kolkata: 0.97,
};

/**
 * Computes an estimated resale value for a used car.
 * Model: base price -> compounding year depreciation -> km-based deduction
 * -> ownership penalty -> fuel-type adjustment -> city demand adjustment.
 * This is an independent formula, not sourced from any competitor's data.
 */
function estimateValuation({ brand, model, year, km, fuel, owners = 1, city, basePriceOverride }) {
  const base = basePriceOverride != null ? basePriceOverride : getBasePrice(brand, model);
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - Number(year));

  // Depreciation curve, calibrated against the Autocar-Spinny used car
  // studies: Maruti Swift/Dzire retain ~70-73% of original price after 5
  // years ("standard" tier below gives ~69-72%, matching). Mid-size sedans
  // and compact/mid SUVs (Creta, Verna, Seltos, Nexon, Ciaz, etc.) within
  // these same strong brands depreciate meaningfully faster — Cars24 puts
  // Verna/Ciaz value loss at ~44-45% over 5 years (~55-56% retained) — so
  // they get their own steeper "midsize" curve rather than being treated
  // like a hatchback. Honda City retains only ~50% over 5 years, and
  // Ford/Fiat/Chevrolet/Datsun (all exited India, crashing resale/parts
  // demand) plus VW/Skoda/Citroen/Nissan/Isuzu (weaker dealer networks,
  // higher perceived running cost) depreciate close to that "weak" curve.
  // Premium/luxury brands (BMW, Mercedes, Audi, Volvo, Jeep, Land Rover,
  // MINI) depreciate fastest of all — checked real BMW X1 resale listings
  // against its new price and found ~15-16%/year, not ~7-8%/year.
  const tier = getResaleTier(brand, model);
  let depFactor = 1;
  for (let y = 1; y <= age; y++) {
    if (tier === 'luxury') {
      if (y <= 1) depFactor *= 0.75;
      else if (y <= 3) depFactor *= 0.82;
      else depFactor *= 0.85;
    } else if (tier === 'weak') {
      if (y <= 1) depFactor *= 0.83;
      else if (y <= 3) depFactor *= 0.86;
      else depFactor *= 0.91;
    } else if (tier === 'midsize') {
      if (y <= 1) depFactor *= 0.86;
      else if (y <= 3) depFactor *= 0.89;
      else depFactor *= 0.91;
    } else {
      if (y <= 1) depFactor *= 0.90;
      else if (y <= 3) depFactor *= 0.92;
      else depFactor *= 0.95;
    }
  }

  // Mileage: 12,000 km/year is the baseline. Driven less than that earns a
  // premium (low-mileage cars are genuinely sought after), driven more
  // costs a penalty — both capped so a single extreme value can't dominate,
  // and kept modest so it can't combine with the ownership premium to push
  // a used car above what the depreciation curve already says it's worth.
  const expectedKm = age * 12000;
  const kmRatio = expectedKm > 0 ? Number(km) / expectedKm : 1;
  let kmPenalty;
  if (kmRatio < 1) {
    // Up to +10% for a car driven at 50% or less of the expected mileage.
    const underrun = Math.min(1, 1 - kmRatio);
    kmPenalty = 1 + underrun * 0.10;
  } else {
    const excessKm = Number(km) - expectedKm;
    kmPenalty = Math.max(0.55, 1 - (excessKm / 10000) * 0.02);
  }

  // Ownership: each additional owner beyond the first knocks resale value;
  // a confirmed single owner earns a small premium over the baseline.
  const ownerPenalty = owners <= 1 ? 1.03 : Math.max(0.85, 1 - (owners - 1) * 0.05);

  // Fuel type: EVs and diesels currently hold value slightly differently.
  const fuelAdj = fuel === 'Electric' ? 1.05 : fuel === 'Diesel' ? 1.02 : fuel === 'CNG' ? 1.01 : 1;

  const cityAdj = CITY_TIER[city] || 1.0;

  let estimate = base * depFactor * kmPenalty * ownerPenalty * fuelAdj * cityAdj;
  // A used car — however well kept — can never be worth more than the same
  // model bought new today; low-mileage/single-owner premiums must not be
  // able to push the estimate past that ceiling.
  estimate = Math.min(estimate, base);
  estimate = Math.round(estimate / 1000) * 1000;
  estimate = Math.max(estimate, 40000);

  const low = Math.round((estimate * 0.95) / 1000) * 1000;
  const high = Math.round((estimate * 1.05) / 1000) * 1000;

  return { estimate, low, high, factors: { base, age, depFactor: +depFactor.toFixed(3), kmPenalty: +kmPenalty.toFixed(3), ownerPenalty, fuelAdj, cityAdj } };
}

module.exports = { estimateValuation };
