// backend/src/models/payment.model.js
const { getPool } = require('../config/db');

async function createPaymentRecord({ order_id = null, user_id = null, method = 'manual', amount = null, screenshot_url = null }) {
  const pool = getPool();
  const res = await pool.query(
    `INSERT INTO payments (order_id, user_id, method, amount, screenshot_url) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [order_id, user_id, method, amount, screenshot_url]
  );
  return res.rows[0];
}

async function markPaymentVerified(paymentId, verifiedByUserId) {
  const pool = getPool();
  const res = await pool.query(
    `UPDATE payments SET verified = true, verified_by = $2, verified_at = NOW() WHERE id = $1 RETURNING *`,
    [paymentId, verifiedByUserId]
  );
  return res.rows[0];
}

module.exports = { createPaymentRecord, markPaymentVerified };
