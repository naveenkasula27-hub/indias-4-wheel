const mongoose = require('mongoose');

// Lets the owner adjust a model's valuation starting price from the dashboard
// without redeploying code. Falls back to server/utils/brandCatalog.js when
// no override exists for a brand+model.
const priceOverrideSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    basePrice: { type: Number, required: true },
  },
  { timestamps: true }
);

priceOverrideSchema.index({ brand: 1, model: 1 }, { unique: true });

module.exports = mongoose.model('PriceOverride', priceOverrideSchema);
