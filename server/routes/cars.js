const express = require('express');
const Car = require('../models/Car');
const { requireAuth } = require('../middleware/auth');
const { listBrands, listModels } = require('../utils/brandCatalog');

const router = express.Router();

// Public: browse cars
router.get('/', async (req, res) => {
  const { brand, bodyType, fuel, minPrice, maxPrice, q, sort } = req.query;
  const filter = { status: 'available' };
  if (brand) filter.brand = brand;
  if (bodyType) filter.bodyType = bodyType;
  if (fuel) filter.fuel = fuel;
  if (minPrice || maxPrice) filter.price = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };
  if (q) filter.name = { $regex: q, $options: 'i' };

  let sortSpec = { createdAt: -1 };
  if (sort === 'price-asc') sortSpec = { price: 1 };
  if (sort === 'price-desc') sortSpec = { price: -1 };
  if (sort === 'km-asc') sortSpec = { km: 1 };
  if (sort === 'year-desc') sortSpec = { year: -1 };

  const cars = await Car.find(filter).sort(sortSpec);
  res.json(cars);
});

router.get('/catalog/brands', (req, res) => {
  res.json(listBrands());
});

router.get('/catalog/models/:brand', (req, res) => {
  res.json(listModels(req.params.brand));
});

router.get('/:id', async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) return res.status(404).json({ error: 'Not found' });
  res.json(car);
});

// Owner-only: manage inventory
router.post('/', requireAuth, async (req, res) => {
  const car = await Car.create(req.body);
  res.status(201).json(car);
});

router.put('/:id', requireAuth, async (req, res) => {
  const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!car) return res.status(404).json({ error: 'Not found' });
  res.json(car);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await Car.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
