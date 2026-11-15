require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const valuationRoutes = require('./routes/valuation');
const loanRoutes = require('./routes/loan');
const leadRoutes = require('./routes/leads');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/valuation', valuationRoutes);
app.use('/api/loan', loanRoutes);
app.use('/api/leads', leadRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
