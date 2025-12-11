-- backend/scripts/add_packages_table.sql

CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'PKR',
  features JSONB DEFAULT '[]'::jsonb,
  delivery_days INT DEFAULT 3,
  revisions INT DEFAULT 1,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(active);
CREATE INDEX IF NOT EXISTS idx_packages_price ON packages(price);
