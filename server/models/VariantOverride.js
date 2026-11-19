const mongoose = require('mongoose');

// Lets the owner correct a specific variant's displayed (on-road) price
// from the dashboard without redeploying code — same idea as
// PriceOverride, but for one variant of a model instead of the whole
// model. Stored as the on-road price (what the admin sees and types),
// since that's the only number that's ever shown to a customer.
const variantOverrideSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    variant: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

variantOverrideSchema.index({ brand: 1, model: 1, variant: 1 }, { unique: true });

module.exports = mongoose.model('VariantOverride', variantOverrideSchema);
