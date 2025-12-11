// backend/src/models/package.model.js
const { getPool } = require('../config/db');

async function createPackage({ title, slug, price = 0, currency = 'PKR', features = [], delivery_days = 3, revisions = 1, active = true, metadata = {} }) {
  const pool = getPool();
  const res = await pool.query(
    `INSERT INTO packages (title, slug, price, currency, features, delivery_days, revisions, active, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [title, slug, price, currency, JSON.stringify(features), delivery_days, revisions, active, metadata]
  );
  return res.rows[0];
}

async function updatePackage(id, data) {
  const pool = getPool();
  const fields = [];
  const vals = [];
  let idx = 1;
  for (const k of Object.keys(data)) {
    fields.push(`${k} = $${idx}`);
    vals.push(data[k]);
    idx++;
  }
  if (fields.length === 0) return null;
  vals.push(id);
  const q = `UPDATE packages SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
  const res = await pool.query(q, vals);
  return res.rows[0];
}

async function findPackageById(id) {
  const pool = getPool();
  const res = await pool.query('SELECT * FROM packages WHERE id = $1 LIMIT 1', [id]);
  return res.rows[0] || null;
}

async function findPackageBySlug(slug) {
  const pool = getPool();
  const res = await pool.query('SELECT * FROM packages WHERE slug = $1 LIMIT 1', [slug]);
  return res.rows[0] || null;
}

async function listPackages(limit = 50, offset = 0, onlyActive = true) {
  const pool = getPool();
  if (onlyActive) {
    const res = await pool.query('SELECT * FROM packages WHERE active = true ORDER BY price ASC LIMIT $1 OFFSET $2', [limit, offset]);
    return res.rows;
  } else {
    const res = await pool.query('SELECT * FROM packages ORDER BY price ASC LIMIT $1 OFFSET $2', [limit, offset]);
    return res.rows;
  }
}

module.exports = { createPackage, updatePackage, findPackageById, findPackageBySlug, listPackages };
