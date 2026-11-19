const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const OtpCode = require('../models/OtpCode');
const { requireCustomerAuth } = require('../middleware/auth');

const router = express.Router();

// Sends the OTP to the customer's phone. No SMS gateway is connected yet —
// wiring one up (MSG91, Twilio, Fast2SMS, etc.) is a real paid third-party
// account the business owner has to set up themselves; this function is
// the one place that call goes once that's done. Until then it logs the
// code server-side and the response includes it under `devOtp` so the
// flow is fully testable end to end without a live SMS account.
async function sendOtpSms(phone, code) {
  console.log(`[DEV MODE — no SMS provider connected] OTP for ${phone}: ${code}`);
}

router.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const existing = await Customer.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const customer = await Customer.create({ name, email: email.toLowerCase(), phone, passwordHash });
  const token = jwt.sign({ id: customer._id, email: customer.email, type: 'customer' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({ token, customer: { name: customer.name, email: customer.email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const customer = await Customer.findOne({ email: email.toLowerCase() });
  if (!customer) return res.status(401).json({ error: 'Invalid email or password' });

  const ok = await bcrypt.compare(password, customer.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ id: customer._id, email: customer.email, type: 'customer' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, customer: { name: customer.name, email: customer.email } });
});

router.post('/otp/request', async (req, res) => {
  const { phone } = req.body;
  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
  }

  const code = String(crypto.randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await OtpCode.findOneAndUpdate({ phone }, { code, expiresAt }, { upsert: true });
  await sendOtpSms(phone, code);

  const devMode = !process.env.SMS_PROVIDER_API_KEY;
  res.json({ ok: true, expiresInMinutes: 10, ...(devMode && { devOtp: code }) });
});

router.post('/otp/verify', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Phone and code are required' });

  const record = await OtpCode.findOne({ phone, code });
  if (!record) return res.status(401).json({ error: 'Incorrect code' });
  if (record.expiresAt < new Date()) return res.status(401).json({ error: 'This code has expired — request a new one' });
  await OtpCode.deleteOne({ _id: record._id });

  let customer = await Customer.findOne({ phone });
  if (!customer) {
    const placeholderEmail = `otp_${phone}@placeholder.indias4wheel.com`;
    const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    customer = await Customer.create({ name: 'Customer', email: placeholderEmail, phone, passwordHash });
  }

  const token = jwt.sign({ id: customer._id, email: customer.email, type: 'customer' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, customer: { name: customer.name, email: customer.email } });
});

router.get('/me', requireCustomerAuth, async (req, res) => {
  const customer = await Customer.findById(req.customer.id).populate('savedCars');
  if (!customer) return res.status(404).json({ error: 'Not found' });

  const leads = await Lead.find({ $or: [{ email: customer.email }, { phone: customer.phone }] }).sort({ createdAt: -1 });

  res.json({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    savedCars: customer.savedCars,
    leads,
  });
});

router.post('/saved-cars/:carId', requireCustomerAuth, async (req, res) => {
  await Customer.findByIdAndUpdate(req.customer.id, { $addToSet: { savedCars: req.params.carId } });
  res.json({ ok: true });
});

router.delete('/saved-cars/:carId', requireCustomerAuth, async (req, res) => {
  await Customer.findByIdAndUpdate(req.customer.id, { $pull: { savedCars: req.params.carId } });
  res.json({ ok: true });
});

module.exports = router;
