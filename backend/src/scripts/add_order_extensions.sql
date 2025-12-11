-- backend/scripts/add_order_extensions.sql
-- Adds columns and new tables for order automation (safe, non-breaking)

-- add chat_id to orders (if not exists)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS chat_id INT REFERENCES chats(id);

-- add external_order_id for merchant reference
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS external_order_id TEXT;

-- order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT,
  title TEXT,
  quantity INT DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- order status history
CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  changed_by INT, -- user id who changed (nullable)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_chat_id ON orders (chat_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_order_id ON order_status_history (order_id);
