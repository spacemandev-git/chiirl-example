# chiirl

Chicago events aggregator. Scrapes events from [Luma](https://lu.ma/chicago) and [Meetup](https://www.meetup.com/) Chicago, stores them in Postgres, and delivers personalized daily digests via email ([Resend](https://resend.com)) and PWA push notifications. Users can also submit their own events for admin approval.

## How it works

1. **Scrape** — Uses [agent-browser](https://github.com/nichochar/agent-browser) to load Luma and Meetup in a headless browser, extract event listings, classify them by tag, and upsert into Postgres.
2. **Broadcast** — Each morning, sends email digests and push notifications to subscribers with upcoming events matching their chosen tags.
3. **Frontend** — SvelteKit PWA for browsing events with smart filtering, user signup via magic link auth, event submission, and admin approval.
4. **Click tracking** — Tracks engagement from both email links (`/r/:userId/:eventId`) and PWA interactions.

## Architecture

Three services designed for Railway deployment:

| Service | Runtime | Purpose |
|---|---|---|
| **Backend/Cron** | Bun | Scrapes events, sends email digests + push notifications, health check |
| **Frontend** | SvelteKit (Node) | PWA for event browsing, auth, submission, admin |
| **Database** | PostgreSQL | Shared by both services |

## Prerequisites

- [Bun](https://bun.sh) (v1.1+)
- [Docker](https://www.docker.com/) (for local Postgres)
- A [Resend](https://resend.com) account (for email)
- VAPID keys for push notifications (`bunx web-push generate-vapid-keys`)

## Setup

```bash
# Clone and install
git clone <repo-url> && cd chiirl
bun install

# Copy env and fill in credentials
cp .env.sample .env

# Start Postgres
docker compose up -d

# Apply the database schema
bun run db:setup

# Set up the frontend
cd frontend
bun install
cp .env.example .env
```

### Backend environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `RESEND_API_KEY` | Resend API key for sending emails |
| `RESEND_FROM_EMAIL` | Sender email address (must be verified in Resend) |
| `VAPID_PUBLIC_KEY` | VAPID public key for web push |
| `VAPID_PRIVATE_KEY` | VAPID private key for web push |
| `VAPID_SUBJECT` | VAPID subject (e.g. `mailto:you@example.com`) |
| `FRONTEND_URL` | Frontend URL for links in emails (e.g. `http://localhost:5173`) |
| `PORT` | Health check server port (default: `3000`) |

### Frontend environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Same Postgres connection string |
| `RESEND_API_KEY` | For sending magic link emails |
| `RESEND_FROM_EMAIL` | Sender email address |
| `VAPID_PUBLIC_KEY` | For client-side push subscription |
| `ADMIN_EMAILS` | Comma-separated admin emails (e.g. `alice@co.com,bob@co.com`) |
| `ORIGIN` | Frontend URL (required by adapter-node) |

## Running

### Backend (cron + health server)

```bash
bun run start          # Production
bun run dev            # Development (hot reload)
```

Schedules:
- **Scrape** every 6 hours (UTC 0, 6, 12, 18) + once on startup
- **Broadcast** daily at 8am Chicago time (14:00 UTC) — email + push in parallel

### Frontend (SvelteKit)

```bash
cd frontend
bun run dev            # Development (port 5173)
bun run build          # Production build
bun run preview        # Preview production build
```

### Run jobs individually

```bash
bun run scrape         # One-off scrape
bun run broadcast      # One-off email digest
bun run push-notify    # One-off push notifications
```

## Authentication

Uses **magic link auth** — no passwords:

1. User enters email at `/login`
2. Receives a sign-in link via Resend (expires in 15 minutes)
3. Clicking the link creates a session (30 day cookie)
4. Admin access is granted if the user's email is in `ADMIN_EMAILS`

## Features

### Event browsing (`/`)
- Smart filtering by tags, date range (Today / This Week / This Weekend), and text search
- Filters are URL-encoded so they're shareable
- Click tracking for engagement analytics

### Event submission (`/submit`)
- Authenticated users can submit events
- Auto-classifies tags from title/description using keyword matching
- Real-time duplicate detection (checks for similar titles + dates)
- Submitted events require admin approval before appearing publicly

### User settings (`/settings`)
- **Notification preferences** — choose between email digest, push notifications, both, or none
- **Tag subscriptions** — select which event categories to receive in your digest (tech, startup, social, arts, sports, food, music, networking, education, health)
- **Profile** — update name
- Account deletion

### Admin panel (`/admin`)
- Available to users whose email is in `ADMIN_EMAILS`
- Review, approve, or reject user-submitted events

### PWA
- Installable as a progressive web app
- Service worker for offline support and push notification handling
- Web push notifications for daily event digests

## Project structure

```
index.ts                              # Backend entry (server + cron)
src/
  server.ts                           # Health check server
  db/
    index.ts                          # Postgres connection (Bun.sql)
    setup.ts                          # Schema migration (destructive)
    schema.sql                        # Database schema
  types.ts                            # Shared types + tag classifier
skills/
  scrape/scripts/
    scrape.ts                         # Scrape orchestrator
    scrape-source.ts                  # Browser-based scraper
  broadcast/scripts/
    broadcast.ts                      # Email digest via Resend
    push-notify.ts                    # Web push notifications
frontend/
  src/
    hooks.server.ts                   # Session resolution middleware
    lib/server/auth.ts                # Magic link + session helpers
    lib/server/db.ts                  # Postgres connection (postgres.js)
    lib/utils.ts                      # Date formatting, tag colors
    routes/
      +page.svelte                    # Home — event listing + filters
      login/                          # Magic link sign-in
      auth/verify/                    # Token verification
      events/[id]/                    # Event detail + bookmarks
      submit/                         # Event submission
      settings/                       # User preferences
      admin/                          # Admin panel
      r/[userId]/[eventId]/           # Email click tracking redirect
      api/                            # track-click, check-duplicate, subscribe-push, health
    service-worker.ts                 # PWA offline + push handler
  static/
    manifest.json                     # PWA manifest
Dockerfile                            # Backend container (Bun)
frontend/Dockerfile                   # Frontend container (Node)
docker-compose.yml                    # Local Postgres
```

## Database schema

Seven tables:

- **events** — Scraped + user-submitted events with title, URL, time, location, tags, and approval status. Deduplicated by `(source, source_id)`.
- **users** — Subscribers with email, name, preferred tags, and notification preference.
- **clicks** — Records when a user clicks a tracked event link (from PWA or email).
- **bookmarks** — User-saved events.
- **push_subscriptions** — Web push subscription endpoints per user.
- **auth_tokens** — Short-lived magic link tokens (15 min TTL).
- **sessions** — Active user sessions (30 day TTL).

Events are auto-classified using keyword matching into tags: `tech`, `startup`, `social`, `arts`, `sports`, `food`, `music`, `networking`, `education`, `health`.

## Deployment (Railway)

1. Create a PostgreSQL service
2. Create a backend service pointing to the root `Dockerfile`
3. Create a frontend service pointing to `frontend/Dockerfile`
4. Set environment variables for both services
5. Generate VAPID keys: `bunx web-push generate-vapid-keys`
6. Run `bun run db:setup` once to initialize the schema
