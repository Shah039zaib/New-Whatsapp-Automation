// backend/src/models/user.model.js
const { getPool } = require('../config/db');

async function createUser({ name = null, email, password }) {
  const pool = getPool();
  const res = await pool.query(
    `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at`,
    [name, email, password]
  );
  return res.rows[0];
}

async function findUserByEmail(email) {
  const pool = getPool();
  const res = await pool.query(`SELECT id, name, email, password FROM users WHERE email = $1 LIMIT 1`, [email]);
  return res.rows[0] || null;
}

async function findUserById(id) {
  const pool = getPool();
  const res = await pool.query(`SELECT id, name, email, created_at FROM users WHERE id = $1 LIMIT 1`, [id]);
  return res.rows[0] || null;
}

module.exports = { createUser, findUserByEmail, findUserById };
