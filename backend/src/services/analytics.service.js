// backend/src/services/analytics.service.js
const { getPool } = require('../config/db');

async function getConversationsCount() {
  const pool = getPool();
  const res = await pool.query('SELECT COUNT(*)::int as total FROM chats');
  return res.rows[0]?.total || 0;
}

async function getSalesSummary() {
  const pool = getPool();
  const res = await pool.query(`SELECT COUNT(*)::int as orders, COALESCE(SUM(amount),0)::numeric as revenue FROM orders WHERE status = 'paid'`);
  return res.rows[0] || { orders: 0, revenue: 0 };
}

module.exports = { getConversationsCount, getSalesSummary };
