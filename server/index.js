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

// On a serverless platform (Vercel) a fresh invocation needs the DB connected
// before any route runs; mongoose caches the connection across warm invocations.
let dbReady = null;
app.use((req, res, next) => {
  if (!dbReady) dbReady = connectDB();
  dbReady.then(() => next()).catch((err) => {
    console.error('DB connection failed:', err.message);
    res.status(503).json({ error: 'Database unavailable' });
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/valuation', valuationRoutes);
app.use('/api/loan', loanRoutes);
app.use('/api/leads', leadRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// Only start a persistent listener when run directly (local dev / Render-style
// hosts). On Vercel, the module is imported and invoked per-request instead.
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

module.exports = app;
