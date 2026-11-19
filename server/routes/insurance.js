const express = require('express');
const crypto = require('crypto');
const InsuranceRequest = require('../models/InsuranceRequest');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function generateRequestCode() {
  return `INS-${crypto.randomInt(100000, 999999)}`;
}

// Public: customer submits an insurance request
router.post('/', async (req, res) => {
  const { name, email, phone, registrationNumber, rcCopy, previousInsuranceCopy } = req.body;
  if (!name || !email || !phone || !registrationNumber) {
    return res.status(400).json({ error: 'Name, email, phone and registration number are required' });
  }

  let requestCode = generateRequestCode();
  // Vanishingly unlikely to collide, but guard against it rather than trust luck.
  while (await InsuranceRequest.findOne({ requestCode })) requestCode = generateRequestCode();

  const saved = await InsuranceRequest.create({
    requestCode, name, email, phone, registrationNumber,
    rcCopy: rcCopy || '', previousInsuranceCopy: previousInsuranceCopy || '',
  });
  res.status(201).json({ requestCode: saved.requestCode });
});

// Owner-only: view and manage insurance requests
router.get('/', requireAuth, async (req, res) => {
  const requests = await InsuranceRequest.find().sort({ createdAt: -1 });
  res.json(requests);
});

router.put('/:id', requireAuth, async (req, res) => {
  const { status } = req.body;
  const updated = await InsuranceRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await InsuranceRequest.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
