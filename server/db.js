const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
  }
  mongoose.set('strictQuery', true);
  // Serverless-tuned: a small pool avoids holding open more sockets than a
  // single function instance needs, and a bounded server-selection timeout
  // fails fast instead of hanging a request if Atlas is slow to respond.
  await mongoose.connect(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 });
  console.log('MongoDB connected');
}

module.exports = connectDB;
