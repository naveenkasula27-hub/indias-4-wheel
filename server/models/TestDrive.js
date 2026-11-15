const mongoose = require('mongoose');

const testDriveSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    carName: { type: String, required: true },
    status: { type: String, enum: ['new', 'scheduled', 'completed', 'cancelled'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TestDrive', testDriveSchema);
