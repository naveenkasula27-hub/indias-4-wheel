const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });
  const saved = await ContactMessage.create({ name, email, message });
  res.status(201).json(saved);
});

router.get('/', requireAuth, async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
});

router.put('/:id', requireAuth, async (req, res) => {
  const updated = await ContactMessage.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

module.exports = router;
