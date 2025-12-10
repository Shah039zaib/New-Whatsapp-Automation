// backend/scripts/migrate.js
require('dotenv').config();
const { getPool } = require('../src/config/db');
const fs = require('fs');
const path = require('path');
const logger = require('../src/utils/logger');

async function run() {
  const pool = getPool();
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  logger.info('Migrations applied');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
