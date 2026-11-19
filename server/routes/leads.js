const express = require('express');
const Lead = require('../models/Lead');
const { requireAuth } = require('../middleware/auth');
const { estimateValuation } = require('../utils/valuation');
const { checkEligibility } = require('../utils/loan');
const { getBasePrice } = require('../utils/brandCatalog');
const PriceOverride = require('../models/PriceOverride');

const router = express.Router();

// Public: customer submits a "sell my car" request
router.post('/', async (req, res) => {
  const { name, phone, email, city, brand, model, year, km, fuel, owners, monthlyIncome } = req.body;
  if (!name || !phone || !city || !brand || !model || !year || km == null || !fuel) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const override = await PriceOverride.findOne({ brand, model });
  const basePriceOverride = override ? override.basePrice : getBasePrice(brand, model);
  const valuationResult = estimateValuation({ brand, model, year, km, fuel, owners, city, basePriceOverride });

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
  const update = { ...req.body };
  if (update.actualSoldPrice) {
    const lead = await Lead.findById(req.params.id);
    if (lead) {
      update.priceDriftPct = ((update.actualSoldPrice - lead.valuation) / update.actualSoldPrice) * 100;
    }
  }
  const lead = await Lead.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!lead) return res.status(404).json({ error: 'Not found' });
  res.json(lead);
});

// Owner-only: recalibration report — average how far off the formula's
// estimate has been from actual sold prices, grouped by brand+model, so
// the Valuation Pricing overrides can be corrected with real evidence
// instead of guesswork.
router.get('/drift-report', requireAuth, async (req, res) => {
  const rows = await Lead.aggregate([
    { $match: { actualSoldPrice: { $ne: null } } },
    {
      $group: {
        _id: { brand: '$brand', model: '$model' },
        samples: { $sum: 1 },
        avgValuation: { $avg: '$valuation' },
        avgActualSoldPrice: { $avg: '$actualSoldPrice' },
        avgDriftPct: { $avg: '$priceDriftPct' },
      },
    },
    { $sort: { avgDriftPct: 1 } },
  ]);

  const report = rows.map((r) => ({
    brand: r._id.brand,
    model: r._id.model,
    samples: r.samples,
    avgValuation: Math.round(r.avgValuation),
    avgActualSoldPrice: Math.round(r.avgActualSoldPrice),
    avgDriftPct: +r.avgDriftPct.toFixed(1),
    // Multiply the brand/model's current Valuation Pricing override (or
    // catalog default) by this to bring future estimates in line with
    // what this model has actually been selling for.
    suggestedBaseMultiplier: +(r.avgActualSoldPrice / r.avgValuation).toFixed(3),
  }));

  res.json(report);
});

// Owner-only: run/re-run a loan eligibility check on an existing lead
router.put('/:id/eligibility', requireAuth, async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Not found' });

  const { monthlyIncome, existingEmis, employmentType, creditScoreBand, tenureMonths } = req.body;
  if (!monthlyIncome) return res.status(400).json({ error: 'monthlyIncome required' });

  const elig = checkEligibility({ carPrice: lead.valuation, monthlyIncome, existingEmis, employmentType, creditScoreBand, tenureMonths });
  lead.loanEligibility = {
    monthlyIncome,
    eligibleAmount: elig.eligibleAmount,
    interestRate: elig.interestRate,
    emi: elig.emi,
    tenureMonths: elig.tenureMonths,
  };
  await lead.save();
  res.json(lead);
});

module.exports = router;
