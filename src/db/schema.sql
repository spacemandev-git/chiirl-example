-- Event tags enum
DO $$ BEGIN
  CREATE TYPE event_tag AS ENUM (
    'co-working',
    'discussion',
    'hangout',
    'networking',
    'pitching-demo',
    'speaker-panel',
    'branding',
    'business-strategy',
    'capital-deployment',
    'code-engineering',
    'finance',
    'fundraising',
    'gtm',
    'legal-ip',
    'marketing',
    'org-management',
    'recruiting',
    'product',
    'pitching-howto',
    'policy',
    'sales',
    'scaling',
    'uiux-cx',
    'concept',
    'pre-seed',
    'seed',
    'series-a',
    'growth',
    'late-stage'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Notification preference enum (legacy, kept for migration)
DO $$ BEGIN
  CREATE TYPE notification_preference AS ENUM ('email', 'push', 'both', 'none');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Digest frequency enum
DO $$ BEGIN
  CREATE TYPE digest_frequency AS ENUM ('daily', 'weekly', 'monthly', 'none');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Event status enum
DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('approved', 'pending', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('luma', 'meetup', 'eventbrite', 'pie', 'user')),
  source_id TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  image_url TEXT,
  tags event_tag[] NOT NULL DEFAULT '{}',
  status event_status NOT NULL DEFAULT 'approved',
  submitted_by INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, source_id)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  tags event_tag[] NOT NULL DEFAULT '{}',
  notification_preference notification_preference NOT NULL DEFAULT 'email',
  email_frequency digest_frequency NOT NULL DEFAULT 'daily',
  push_frequency digest_frequency NOT NULL DEFAULT 'none',
  last_email_digest_at TIMESTAMPTZ,
  last_push_digest_at TIMESTAMPTZ,
  last_test_digest_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clicks table
CREATE TABLE IF NOT EXISTS clicks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  event_id INTEGER NOT NULL REFERENCES events(id),
  source TEXT NOT NULL DEFAULT 'pwa' CHECK (source IN ('pwa', 'email')),
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);

-- Foreign key for submitted_by (after users table exists)
ALTER TABLE events ADD CONSTRAINT fk_events_submitted_by
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Auth tokens (magic link)
CREATE TABLE IF NOT EXISTS auth_tokens (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_users_tags ON users USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);

-- === MIGRATIONS ===
-- Everything below this line runs as individual statements (outside a transaction)
-- to support ALTER TYPE ADD VALUE and idempotent migrations on existing databases.

-- Add 'past' status for events that have already occurred
DO $$ BEGIN
  ALTER TYPE event_status ADD VALUE IF NOT EXISTS 'past';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Migrate event_tag enum: add new values for existing databases
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'co-working'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'discussion'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'hangout'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'pitching-demo'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'speaker-panel'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'branding'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'business-strategy'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'capital-deployment'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'code-engineering'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'finance'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'fundraising'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'gtm'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'legal-ip'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'org-management'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'recruiting'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'product'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'pitching-howto'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'policy'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'scaling'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'uiux-cx'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'concept'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'pre-seed'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'seed'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'series-a'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'growth'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE event_tag ADD VALUE IF NOT EXISTS 'late-stage'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Migrate: add digest frequency columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_frequency digest_frequency NOT NULL DEFAULT 'daily';
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_frequency digest_frequency NOT NULL DEFAULT 'none';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_email_digest_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_push_digest_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_test_digest_at TIMESTAMPTZ;

-- Migrate existing notification_preference into new columns
UPDATE users SET email_frequency = 'daily', push_frequency = 'none'
  WHERE notification_preference = 'email' AND email_frequency = 'daily' AND push_frequency = 'none';
UPDATE users SET email_frequency = 'none', push_frequency = 'daily'
  WHERE notification_preference = 'push' AND email_frequency = 'daily' AND push_frequency = 'none';
UPDATE users SET email_frequency = 'daily', push_frequency = 'daily'
  WHERE notification_preference = 'both' AND email_frequency = 'daily' AND push_frequency = 'none';
UPDATE users SET email_frequency = 'none', push_frequency = 'none'
  WHERE notification_preference = 'none' AND email_frequency = 'daily' AND push_frequency = 'none';
