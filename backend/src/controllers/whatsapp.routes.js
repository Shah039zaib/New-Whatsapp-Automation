// backend/src/routes/whatsapp.routes.js
const express = require('express');
const router = express.Router();
const { sendText, sendMedia, status } = require('../controllers/whatsapp.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer({ dest: '/tmp' });

router.get('/status', authMiddleware, status);
router.post('/send-text', authMiddleware, sendText);
router.post('/send-media', authMiddleware, upload.single('file'), sendMedia);

module.exports = router;
