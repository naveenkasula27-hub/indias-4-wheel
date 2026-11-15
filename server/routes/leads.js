const express = require('express');
const Lead = require('../models/Lead');
const { requireAuth } = require('../middleware/auth');
const { estimateValuation } = require('../utils/valuation');
const { checkEligibility } = require('../utils/loan');

const router = express.Router();

// Public: customer submits a "sell my car" request
router.post('/', async (req, res) => {
  const { name, phone, email, city, brand, model, year, km, fuel, owners, monthlyIncome } = req.body;
  if (!name || !phone || !city || !brand || !model || !year || km == null || !fuel) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const valuationResult = estimateValuation({ brand, model, year, km, fuel, owners, city });

  let loanEligibility;
  if (monthlyIncome) {
    const elig = checkEligibility({ carPrice: valuationResult.estimate, monthlyIncome });
    loanEligibility = {
      monthlyIncome,
      eligibleAmount: elig.eligibleAmount,
      interestRate: elig.interestRate,
      emi: elig.emi,
      tenureMonths: elig.tenureMonths,
    };
  }

  const lead = await Lead.create({
    name, phone, email, city, brand, model, year, km, fuel, owners,
    valuation: valuationResult.estimate,
    loanEligibility,
  });

  res.status(201).json({ lead, valuation: valuationResult });
});

// Owner-only: view and manage leads
router.get('/', requireAuth, async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 });
  res.json(leads);
});

router.put('/:id', requireAuth, async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!lead) return res.status(404).json({ error: 'Not found' });
  res.json(lead);
});

module.exports = router;
