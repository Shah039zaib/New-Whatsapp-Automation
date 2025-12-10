-- backend/scripts/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT UNIQUE,
  summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  chat_id INT REFERENCES chats(id) ON DELETE CASCADE,
  sender TEXT,
  role TEXT,
  content TEXT,
  meta JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total NUMERIC,
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  user_id INT REFERENCES users(id),
  method TEXT,
  amount NUMERIC,
  screenshot_url TEXT,
  verified BOOLEAN DEFAULT false,
  verified_by INT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id SERIAL PRIMARY KEY,
  account_id TEXT UNIQUE,
  meta JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
