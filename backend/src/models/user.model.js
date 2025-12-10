// backend/src/models/user.model.js
const { getPool } = require('../config/db');

async function createUser({ name, email, password }) {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email`,
    [name || null, email, password]
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
  const pool = getPool();
  const res = await pool.query(`SELECT id, name, email, password FROM users WHERE email = $1 LIMIT 1`, [email]);
  return res.rows[0] || null;
}

module.exports = { createUser, findUserByEmail };
