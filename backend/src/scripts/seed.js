// backend/scripts/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getPool } = require('../src/config/db');

async function seed() {
  const pool = getPool();
  const hashed = await bcrypt.hash('admin123', 10);
  await pool.query(`INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`, ['Admin','admin@example.com',hashed,'admin']);
  console.log('Seeded admin user: admin@example.com / admin123');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
