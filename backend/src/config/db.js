// backend/src/config/db.js
const { Pool } = require('pg');

let pool = null;

function initDB() {
  if (pool) return pool;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // quick sanity check
  pool.query('SELECT NOW()').then(() => {
    console.log('Postgres connected');
  }).catch(err => {
    console.error('Postgres connection error', err.message);
  });

  return pool;
}

function getPool() {
  if (!pool) initDB();
  return pool;
}

module.exports = { initDB, getPool };
