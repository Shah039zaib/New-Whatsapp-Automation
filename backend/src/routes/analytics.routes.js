// backend/src/routes/analytics.routes.js
const express = require('express');
const router = express.Router();
const { getOverview } = require('../controllers/analytics.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.get('/overview', authMiddleware, getOverview);

module.exports = router;
