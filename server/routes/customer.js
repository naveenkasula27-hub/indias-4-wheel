const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const { requireCustomerAuth } = require('../middleware/auth');

const router = express.Router();

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
