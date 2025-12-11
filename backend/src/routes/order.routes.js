// backend/src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const { createFromChat, setStatus, getOne, list } = require('../controllers/order.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// create order from chat (can be called by admin or WA/AI via API)
router.post('/from-chat', authMiddleware, createFromChat);

// set/change order status
router.post('/:orderId/status', authMiddleware, setStatus);

// get order
router.get('/:orderId', authMiddleware, getOne);

// list orders
router.get('/', authMiddleware, list);

module.exports = router;
