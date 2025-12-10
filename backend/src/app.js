// backend/src/app.js
const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const healthRoutes = require('./routes/health.routes');

const app = express();

app.use(cors());
app.use(express.json());

// init DB pool (no migrations here, simple pool)
initDB();

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: 'Server error' });
});

module.exports = app;
