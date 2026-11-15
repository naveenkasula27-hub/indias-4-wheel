const express = require('express');
const { estimateValuation } = require('../utils/valuation');

const router = express.Router();

router.post('/', (req, res) => {
  const { brand, model, year, km, fuel, owners, city } = req.body;
  if (!brand || !model || !year || km == null || !fuel || !city) {
    return res.status(400).json({ error: 'brand, model, year, km, fuel, city are required' });
  }
  const result = estimateValuation({ brand, model, year, km, fuel, owners, city });
  res.json(result);
});

module.exports = router;
