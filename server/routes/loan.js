const express = require('express');
const { checkEligibility } = require('../utils/loan');

const router = express.Router();

router.post('/eligibility', (req, res) => {
  const { carPrice, downPayment, monthlyIncome, existingEmis, employmentType, creditScoreBand, tenureMonths } = req.body;
  if (!carPrice || !monthlyIncome) {
    return res.status(400).json({ error: 'carPrice and monthlyIncome are required' });
  }
  const result = checkEligibility({ carPrice, downPayment, monthlyIncome, existingEmis, employmentType, creditScoreBand, tenureMonths });
  res.json(result);
});

module.exports = router;
