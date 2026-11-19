const mongoose = require('mongoose');

// Short-lived mobile OTP codes for customer login. Not linked to Customer
// directly so a phone can request a fresh code without touching any
// existing account record until it's actually verified.
const otpCodeSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OtpCode', otpCodeSchema);
