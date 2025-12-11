// backend/src/models/message.model.js
const { getPool } = require('../config/db');

async function createMessage({ chat_id, sender, direction, message, ts = Date.now(), raw = null }) {
  const pool = getPool();
  const res = await pool.query(
    `INSERT INTO messages (chat_id, sender, direction, message, ts, raw)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [chat_id, sender, direction, message, ts, raw]
  );
  return res.rows[0];
}

async function listMessages(chat_id, limit = 100, offset = 0) {
  const pool = getPool();
  const res = await pool.query(
    `SELECT * FROM messages
     WHERE chat_id = $1
     ORDER BY ts ASC
     LIMIT $2 OFFSET $3`,
    [chat_id, limit, offset]
  );
  return res.rows;
}

module.exports = {
  createMessage,
  listMessages
};
