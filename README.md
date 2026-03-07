Getting Started

1. Start Postgres: docker compose up -d
2. Fill in .env: Add your Twilio credentials
3. Apply schema: bun run db:setup
4. Scrape events: bun run scrape
5. Start redirect server: bun run dev
6. Send broadcasts: bun run broadcast

## Testing

1. bun scripts/sample_users.ts
   This will add a couple testing users with the same phone number (defined at the top of the script)

# About

Scrapes Chicago events from Luma / Meetup using agent browswer, categorizes and stores them in postgres database. Goes through users table in postgres to send out text messages with events relvant to them in the morning. Tracks if the user clicks on any of the links in the text message using a redirect server.
