const express = require('express');
const { estimateValuation } = require('../utils/valuation');
const { BRAND_CATALOG, listBrands, listModels, getBasePrice, listVariants } = require('../utils/brandCatalog');
const PriceOverride = require('../models/PriceOverride');
const VariantOverride = require('../models/VariantOverride');
const { resolveVariantMultiplier } = require('../utils/variantResolver');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

async function resolveBasePrice(brand, model, variant) {
  const override = await PriceOverride.findOne({ brand, model });
  const base = override ? override.basePrice : getBasePrice(brand, model);
  const variantMultiplier = await resolveVariantMultiplier(brand, model, variant);
  return variant ? Math.round((base * variantMultiplier) / 1000) * 1000 : base;
}

router.post('/', async (req, res) => {
  const { brand, model, variant, year, km, fuel, owners, city } = req.body;
  if (!brand || !model || !year || km == null || !fuel || !city) {
    return res.status(400).json({ error: 'brand, model, year, km, fuel, city are required' });
  }
  const basePriceOverride = await resolveBasePrice(brand, model, variant);
  const result = estimateValuation({ brand, model, year, km, fuel, owners, city, basePriceOverride });
  res.json(result);
});

// Public: brand/model/variant dropdown data
router.get('/catalog/brands', (req, res) => res.json(listBrands()));
router.get('/catalog/models/:brand', (req, res) => res.json(listModels(req.params.brand)));
router.get('/catalog/variants/:brand/:model', async (req, res) => {
  const { brand, model } = req.params;
  const defaults = listVariants(brand, model);
  const overrides = await VariantOverride.find({ brand, model });
  const overrideMap = new Map(overrides.map((o) => [o.variant, o.price]));
  res.json(defaults.map((v) => ({ ...v, price: overrideMap.has(v.name) ? overrideMap.get(v.name) : v.price })));
});

// Owner-only: view and edit the valuation starting price for every model
router.get('/catalog/prices', requireAuth, async (req, res) => {
  const overrides = await PriceOverride.find();
  const overrideMap = new Map(overrides.map((o) => [`${o.brand}::${o.model}`, o.basePrice]));
  const rows = [];
  for (const brand of listBrands()) {
    for (const model of listModels(brand)) {
      const key = `${brand}::${model}`;
      rows.push({
        brand,
        model,
        defaultPrice: getBasePrice(brand, model),
        currentPrice: overrideMap.has(key) ? overrideMap.get(key) : getBasePrice(brand, model),
        overridden: overrideMap.has(key),
      });
    }
  }
  res.json(rows);
});

router.put('/catalog/prices', requireAuth, async (req, res) => {
  const { brand, model, basePrice } = req.body;
  if (!brand || !model || !basePrice) return res.status(400).json({ error: 'brand, model, basePrice required' });
  const updated = await PriceOverride.findOneAndUpdate(
    { brand, model },
    { basePrice },
    { upsert: true, new: true }
  );
  res.json(updated);
});

router.delete('/catalog/prices', requireAuth, async (req, res) => {
  const { brand, model } = req.body;
  await PriceOverride.deleteOne({ brand, model });
  res.json({ ok: true, defaultPrice: getBasePrice(brand, model) });
});

// Owner-only: view and edit each variant's displayed (on-road) price
router.get('/catalog/variant-prices', requireAuth, async (req, res) => {
  const overrides = await VariantOverride.find();
  const overrideMap = new Map(overrides.map((o) => [`${o.brand}::${o.model}::${o.variant}`, o.price]));
  const rows = [];
  for (const brand of listBrands()) {
    for (const model of listModels(brand)) {
      for (const v of listVariants(brand, model)) {
        const key = `${brand}::${model}::${v.name}`;
        rows.push({
          brand,
          model,
          variant: v.name,
          defaultPrice: v.price,
          currentPrice: overrideMap.has(key) ? overrideMap.get(key) : v.price,
          overridden: overrideMap.has(key),
        });
      }
    }
  }
  res.json(rows);
});

router.put('/catalog/variant-prices', requireAuth, async (req, res) => {
  const { brand, model, variant, price } = req.body;
  if (!brand || !model || !variant || !price) return res.status(400).json({ error: 'brand, model, variant, price required' });
  const updated = await VariantOverride.findOneAndUpdate(
    { brand, model, variant },
    { price },
    { upsert: true, new: true }
  );
  res.json(updated);
});

router.delete('/catalog/variant-prices', requireAuth, async (req, res) => {
  const { brand, model, variant } = req.body;
  await VariantOverride.deleteOne({ brand, model, variant });
  const defaults = listVariants(brand, model);
  const match = defaults.find((v) => v.name === variant);
  res.json({ ok: true, defaultPrice: match ? match.price : null });
});

module.exports = router;
