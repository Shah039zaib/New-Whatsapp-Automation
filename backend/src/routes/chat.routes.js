// backend/src/routes/chat.routes.js
const express = require('express');
const router = express.Router();
const { webhookStore, listChats, getMessages } = require('../controllers/chat.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// WhatsApp → backend webhook
router.post('/webhook', webhookStore);

// Admin
router.get('/', authMiddleware, listChats);
router.get('/:jid/messages', authMiddleware, getMessages);

module.exports = router;
