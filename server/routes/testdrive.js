const express = require('express');
const TestDrive = require('../models/TestDrive');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, phone, carId, carName } = req.body;
  if (!name || !phone || !carId || !carName) return res.status(400).json({ error: 'Missing required fields' });
  const request = await TestDrive.create({ name, phone, carId, carName });
  res.status(201).json(request);
});

router.get('/', requireAuth, async (req, res) => {
  const requests = await TestDrive.find().sort({ createdAt: -1 });
  res.json(requests);
});

router.put('/:id', requireAuth, async (req, res) => {
  const updated = await TestDrive.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

module.exports = router;
