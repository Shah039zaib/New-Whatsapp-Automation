// backend/src/models/order.model.js
const { getPool } = require('../config/db');

async function createOrder({ user_id = null, total = 0, status = 'pending', metadata = {}, chat_id = null, external_order_id = null }) {
  const pool = getPool();
  const res = await pool.query(
    `INSERT INTO orders (user_id, total, status, metadata, chat_id, external_order_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [user_id, total, status, metadata, chat_id, external_order_id]
  );
  return res.rows[0];
}

async function updateOrderStatus(orderId, status, note = null, changedBy = null) {
  const pool = getPool();
  await pool.query(`UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1`, [orderId, status]);
  const res = await pool.query(
    `INSERT INTO order_status_history (order_id, status, note, changed_by) VALUES ($1,$2,$3,$4) RETURNING *`,
    [orderId, status, note, changedBy]
  );
  return res.rows[0];
}

async function getOrderById(orderId) {
  const pool = getPool();
  const res = await pool.query(`SELECT * FROM orders WHERE id = $1 LIMIT 1`, [orderId]);
  return res.rows[0] || null;
}

async function listOrders(limit = 50, offset = 0) {
  const pool = getPool();
  const res = await pool.query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
  return res.rows;
}

module.exports = { createOrder, updateOrderStatus, getOrderById, listOrders };
