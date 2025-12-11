-- backend/scripts/add_chat_tables.sql

CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  jid TEXT UNIQUE NOT NULL,
  account_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  chat_id INT REFERENCES chats(id) ON DELETE CASCADE,
  sender TEXT,            -- 'user' | 'assistant'
  direction TEXT,         -- 'inbound' | 'outbound'
  message TEXT,
  ts BIGINT,              -- epoch ms
  raw JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chats_jid ON chats (jid);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id_ts ON messages (chat_id, ts);
