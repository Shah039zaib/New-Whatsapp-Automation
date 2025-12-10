// backend/src/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: '/tmp' });
const { verifyPayment } = require('../controllers/payment.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.post('/verify', authMiddleware, upload.single('screenshot'), verifyPayment);

module.exports = router;
