// backend/src/config/db.js
const { Pool } = require('pg');
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

let pool = null;

function initDB() {
  if (pool) return pool;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  });

  pool.on('error', (err) => {
    logger.error('Unexpected PG client error', err);
  });

  // quick check
  pool.query('SELECT 1').then(() => logger.info('Postgres connected')).catch(err => {
    logger.error('Postgres connection failed: ' + (err && err.message));
  });

  return pool;
}

function getPool() {
  if (!pool) initDB();
  return pool;
}

module.exports = { initDB, getPool };
