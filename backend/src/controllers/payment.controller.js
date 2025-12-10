// backend/src/controllers/payment.controller.js
const apiResponse = require('../utils/apiResponse');
const cloudinary = require('../services/cloudinary.service');
const { createPaymentRecord, markPaymentVerified } = require('../models/payment.model');

async function verifyPayment(req, res, next) {
  try {
    const { orderId, method, amount } = req.body;
    if (!req.file) return apiResponse.error(res, 'Screenshot required', 400);
    // upload screenshot
    const uploadRes = await cloudinary.uploadFile(req.file.path, 'payments');
    // create payment record
    const record = await createPaymentRecord({
      order_id: orderId || null,
      user_id: req.user?.id || null,
      method: method || 'manual',
      amount: amount || null,
      screenshot_url: uploadRes.secure_url
    });
    // optionally auto-verify? keep manual verification workflow.
    return apiResponse.ok(res, { payment: record });
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyPayment };
