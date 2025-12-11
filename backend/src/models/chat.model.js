// backend/src/models/chat.model.js
const { getPool } = require('../config/db');

async function findChatByJid(jid) {
  const pool = getPool();
  const res = await pool.query(
    'SELECT * FROM chats WHERE jid = $1 LIMIT 1',
    [jid]
  );
  return res.rows[0] || null;
}

async function createChat({ jid, accountId = null, metadata = {} }) {
  const pool = getPool();
  const res = await pool.query(
    `INSERT INTO chats (jid, account_id, metadata)
     VALUES ($1, $2, $3)
     ON CONFLICT (jid) DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [jid, accountId, metadata]
  );
  return res.rows[0];
}

async function ensureChat(jid, accountId = null, metadata = {}) {
  const existing = await findChatByJid(jid);
  if (existing) return existing;
  return createChat({ jid, accountId, metadata });
}

async function listChats(limit = 50, offset = 0) {
  const pool = getPool();
  const res = await pool.query(
    'SELECT * FROM chats ORDER BY updated_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return res.rows;
}

module.exports = {
  findChatByJid,
  createChat,
  ensureChat,
  listChats
};
