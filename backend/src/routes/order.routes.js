// backend/src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const { createFromChat, createFromChatInternal, setStatus, getOne, list } = require('../controllers/order.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const internalAuth = require('../middlewares/internalAuth.middleware');

// Admin routes (require auth)
router.post('/from-chat', authMiddleware, createFromChat);
router.post('/:orderId/status', authMiddleware, setStatus);
router.get('/:orderId', authMiddleware, getOne);
router.get('/', authMiddleware, list);

// Internal route (called from WA server) — secure via internal secret
router.post('/from-chat-internal', internalAuth, createFromChatInternal);

module.exports = router;
