# chiirl - Chicago Events Aggregator

Scrapes events from Luma and Meetup Chicago, stores in Postgres, sends daily email digests via Resend and push notifications. SvelteKit PWA frontend for browsing, submitting, and managing events.

## Architecture (3 Railway Services)

1. **Backend/Cron** (Bun) — scrapes events, sends email digests + push notifications, health check
2. **PostgreSQL** — shared database
3. **Frontend** (SvelteKit + adapter-node) — PWA with event browsing, filtering, signup, submission, admin

## Commands

### Backend (root)
- `docker compose up -d` — Start local Postgres
- `bun run db:setup` — Apply database schema (destructive)
- `bun run scrape` — Scrape events from Luma & Meetup
- `bun run broadcast` — Send email digests via Resend
- `bun run push-notify` — Send push notifications
- `bun run dev` — Start backend with hot reload (cron + health server)
- `bun run start` — Start backend (production)

### Frontend (`cd frontend/`)
- `bun install` — Install frontend deps
- `bun run dev` — Start SvelteKit dev server (port 5173)
- `bun run build` — Build for production
- `bun run preview` — Preview production build

## Project Structure
- `src/` — Core backend code (db, types, server)
- `skills/scrape/` — Event scraping (SKILL.md + scripts/)
- `skills/broadcast/` — Email digest + push notifications (SKILL.md + scripts/)
- `frontend/` — SvelteKit PWA
  - `src/routes/` — Pages and API routes
  - `src/lib/server/db.ts` — Postgres connection (uses `postgres` npm package)
  - `src/lib/utils.ts` — Shared utilities (date formatting, tag colors)
  - `static/` — PWA manifest, icons

## Bun Conventions

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## Backend APIs

- `Bun.serve()` for the health check server. Don't use `express`.
- `Bun.sql` for Postgres in the backend. Don't use `pg` or `postgres.js`.
- Prefer `Bun.file` over `node:fs`
- Bun.$`ls` instead of execa.

## Frontend Notes

- SvelteKit 5 with runes mode (`$state`, `$derived`, `$effect`, `$props`)
- Uses `postgres` npm package for DB access (runs on Node via adapter-node, not Bun)
- Always add keys to `{#each}` blocks
- Chicago Editorial design: Fraunces + Source Sans 3, brick red / cream / charcoal palette

## Environment Variables

### Backend
- `DATABASE_URL` — Postgres connection string
- `RESEND_API_KEY` — Resend email API key
- `RESEND_FROM_EMAIL` — Sender email address
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` — Web push keys
- `FRONTEND_URL` — Frontend URL for email links
- `PORT` — Health check server port (default 3000)

### Frontend
- `DATABASE_URL` — Same Postgres connection
- `RESEND_API_KEY` — For sending magic link emails
- `RESEND_FROM_EMAIL` — Sender email address
- `VAPID_PUBLIC_KEY` — For client-side push subscription
- `ADMIN_EMAILS` — Comma-separated admin emails (e.g. `admin@example.com,alice@co.com`)
- `ORIGIN` — Frontend URL (required by adapter-node)

## Auth
- Magic link authentication via Resend (no passwords)
- `/login` — enter email → receive magic link → click to sign in
- `/auth/verify?token=xxx` — verifies token, creates session
- Sessions stored in DB, resolved via `hooks.server.ts` → `locals.user`
- Admin access: if user's email is in `ADMIN_EMAILS` env var

## Testing

Use `bun test` to run tests.

```ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```
