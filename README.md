# chiirl

Chicago events aggregator. Scrapes events from [Luma](https://lu.ma/chicago) and [Meetup](https://www.meetup.com/) Chicago, stores them in Postgres, and sends personalized daily SMS digests to subscribers via Twilio. Includes click tracking to measure engagement.

## How it works

1. **Scrape** — Uses [agent-browser](https://github.com/nichochar/agent-browser) to load Luma and Meetup in a headless browser, extract event listings, classify them by tag (tech, social, food, music, etc.), and upsert them into Postgres.
2. **Broadcast** — Each morning, queries upcoming events matching each subscriber's chosen tags, composes an SMS with tracked links, and sends it via Twilio.
3. **Click tracking** — A lightweight HTTP server redirects `/r/:userId/:eventId` links to the real event URL and records the click in the database.

All three run as a single process via `index.ts` with built-in cron scheduling.

## Prerequisites

- [Bun](https://bun.sh) (v1.1+)
- [Docker](https://www.docker.com/) (for Postgres)
- A [Twilio](https://www.twilio.com/) account (for SMS)

## Setup

```bash
# Clone and install
git clone <repo-url> && cd chiirl
bun install

# Copy env and fill in your Twilio credentials
cp .env.sample .env

# Start Postgres
docker compose up -d

# Apply the database schema
bun run db:setup
```

### Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string (default: `postgres://chiirl:chiirl@localhost:5432/chiirl`) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number to send from |
| `BASE_URL` | Public URL for click tracking links (default: `http://localhost:3000`) |
| `PORT` | Server port (default: `3000`) |

## Running

```bash
# Start everything (server + cron jobs)
bun run start

# Start with hot reload for development
bun run dev
```

This starts the click-tracking server and schedules:
- **Scrape** every 6 hours (UTC 0, 6, 12, 18) + once on startup
- **Broadcast** daily at 8am Chicago time (14:00 UTC)

### Run jobs individually

```bash
bun run scrape      # One-off scrape
bun run broadcast   # One-off broadcast
bun run serve       # Click tracking server only
```

## Project structure

```
index.ts                          # Unified entry point (server + cron)
src/
  server.ts                       # Click tracking redirect server
  db/
    index.ts                      # Postgres connection (Bun.sql)
    setup.ts                      # Schema migration script
    schema.sql                    # Database schema
  types.ts                        # Shared types (ChiEvent, User, Click, EventTag)
skills/
  scrape/scripts/
    scrape.ts                     # Scrape orchestrator (runs luma + meetup in parallel)
    scrape-source.ts              # Browser-based scraper for a single source
  broadcast/scripts/
    broadcast.ts                  # Daily SMS broadcast
docker-compose.yml                # Postgres container
```

## Database schema

Three tables:

- **events** — Scraped events with title, URL, time, location, and tags. Deduplicated by `(source, source_id)`.
- **users** — Subscribers with phone number, name, preferred tags, and subscription status.
- **clicks** — Records when a user clicks a tracked event link.

Events are auto-classified using keyword matching into tags: `tech`, `startup`, `social`, `arts`, `sports`, `food`, `music`, `networking`, `education`, `health`.
