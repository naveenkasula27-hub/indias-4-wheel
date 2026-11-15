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
