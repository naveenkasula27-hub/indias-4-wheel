const express = require('express');
const { estimateValuation } = require('../utils/valuation');
const { BRAND_CATALOG, listBrands, listModels, getBasePrice } = require('../utils/brandCatalog');
const PriceOverride = require('../models/PriceOverride');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

async function resolveBasePrice(brand, model) {
  const override = await PriceOverride.findOne({ brand, model });
  return override ? override.basePrice : getBasePrice(brand, model);
}

router.post('/', async (req, res) => {
  const { brand, model, year, km, fuel, owners, city } = req.body;
  if (!brand || !model || !year || km == null || !fuel || !city) {
    return res.status(400).json({ error: 'brand, model, year, km, fuel, city are required' });
  }
  const basePriceOverride = await resolveBasePrice(brand, model);
  const result = estimateValuation({ brand, model, year, km, fuel, owners, city, basePriceOverride });
  res.json(result);
});

// Public: brand/model dropdown data
router.get('/catalog/brands', (req, res) => res.json(listBrands()));
router.get('/catalog/models/:brand', (req, res) => res.json(listModels(req.params.brand)));

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

module.exports = router;
