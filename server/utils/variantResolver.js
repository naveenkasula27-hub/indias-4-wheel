const VariantOverride = require('../models/VariantOverride');
const { getBasePrice, getVariantMultiplier, onRoadMultiplier } = require('./brandCatalog');

// Converts an admin-entered on-road override price back into the
// ex-showroom-equivalent multiplier the valuation engine actually uses —
// the override is stored as an on-road number (the only number a customer
// ever sees), but the resale valuation math needs the ex-showroom anchor,
// for the same reason the on-road premium is never applied to valuation
// math elsewhere: it was calibrated against real resale listings using
// that ex-showroom-equivalent anchor.
async function resolveVariantMultiplier(brand, model, variant) {
  if (!variant) return 1;
  const override = await VariantOverride.findOne({ brand, model, variant });
  if (!override) return getVariantMultiplier(brand, model, variant);

  const basePrice = getBasePrice(brand, model);
  if (!basePrice) return getVariantMultiplier(brand, model, variant);
  const impliedExShowroom = override.price / onRoadMultiplier(override.price);
  return impliedExShowroom / basePrice;
}

module.exports = { resolveVariantMultiplier };
