// backend/src/models/orderItem.model.js
const { getPool } = require('../config/db');

async function createOrderItem({ order_id, product_id = null, title = null, quantity = 1, unit_price = 0, metadata = {} }) {
  const pool = getPool();
  const res = await pool.query(
    `INSERT INTO order_items (order_id, product_id, title, quantity, unit_price, metadata)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [order_id, product_id, title, quantity, unit_price, metadata]
  );
  return res.rows[0];
}

async function listOrderItems(order_id) {
  const pool = getPool();
  const res = await pool.query(`SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC`, [order_id]);
  return res.rows;
}

module.exports = { createOrderItem, listOrderItems };
