// backend/src/routes/health.routes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ ok: true, status: 'alive' });
});

module.exports = router;
