const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    bodyType: { type: String, required: true },
    fuel: { type: String, required: true, enum: ['Petrol', 'Diesel', 'Electric', 'CNG'] },
    transmission: { type: String, required: true, enum: ['Manual', 'Automatic'] },
    year: { type: Number, required: true },
    km: { type: Number, required: true },
    owners: { type: Number, required: true, default: 1 },
    city: { type: String, required: true },
    price: { type: Number, required: true },
    emi: { type: Number, required: true },
    badge: { type: String, default: '' },
    aged: { type: Boolean, default: false },
    photo: { type: String, default: '' },
    photos: { type: [String], default: [] },
    interior: { type: String, default: '' },
    features: { type: [String], default: [] },
    description: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['available', 'sold', 'hidden'], default: 'available' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Car', carSchema);
