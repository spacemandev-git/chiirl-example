-- Event tags enum
DO $$ BEGIN
  CREATE TYPE event_tag AS ENUM (
    'tech',
    'startup',
    'social',
    'arts',
    'sports',
    'food',
    'music',
    'networking',
    'education',
    'health'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('luma', 'meetup')),
  source_id TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  image_url TEXT,
  tags event_tag[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, source_id)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  name TEXT,
  tags event_tag[] NOT NULL DEFAULT '{}',
  subscribed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clicks table (only populated when a user actually clicks a link)
CREATE TABLE IF NOT EXISTS clicks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  event_id INTEGER NOT NULL REFERENCES events(id),
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_users_tags ON users USING GIN(tags);
