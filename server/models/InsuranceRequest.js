const mongoose = require('mongoose');

const insuranceRequestSchema = new mongoose.Schema(
  {
    requestCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    // Stored as base64 data URLs — no file-storage service (S3/Cloudinary)
    // is connected yet, and this project's hosting is serverless with no
    // persistent disk, so this is the pragmatic option until a real file
    // store is wired up. Each file is capped client-side at ~1MB to stay
    // well under Vercel's request body limit for serverless functions.
    rcCopy: { type: String, default: '' },
    previousInsuranceCopy: { type: String, default: '' },
    status: { type: String, enum: ['new', 'contacted', 'quoted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InsuranceRequest', insuranceRequestSchema);
