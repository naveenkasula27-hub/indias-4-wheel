const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    city: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    km: { type: Number, required: true },
    fuel: { type: String, required: true },
    owners: { type: Number, default: 1 },
    valuation: { type: Number, required: true },
    // What the car actually sold for once the deal closes. Comparing this
    // against `valuation` over time is how the pricing engine gets smarter
    // without redeploying code — the same idea behind Droom's OBV, just
    // starting from our own transaction history instead of theirs.
    actualSoldPrice: { type: Number, default: null },
    // (actualSoldPrice - valuation) / actualSoldPrice * 100, stored at the
    // moment actualSoldPrice is recorded so the drift report below doesn't
    // need to re-run the valuation formula for historical leads.
    priceDriftPct: { type: Number, default: null },
    loanEligibility: {
      monthlyIncome: Number,
      eligibleAmount: Number,
      interestRate: Number,
      emi: Number,
      tenureMonths: Number,
    },
    status: { type: String, enum: ['new', 'contacted', 'inspection_booked', 'closed', 'rejected'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
