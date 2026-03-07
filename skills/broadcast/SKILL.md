---
name: broadcast
description: Sends daily SMS notifications to subscribed users with relevant Chicago events based on their tag preferences. Uses Twilio for messaging and includes click-tracked redirect links.
compatibility: Requires Twilio credentials, docker (postgres), bun, and internet access
allowed-tools: Bash(bun:*) Read
---

# Broadcast Skill

Sends personalized event digests to subscribed users via SMS.

## Steps

1. Run the broadcast script:
   ```bash
   bun run skills/broadcast/scripts/broadcast.ts
   ```

2. The script will:
   - Query all subscribed users from the database
   - For each user, find today's/upcoming events matching their tag preferences
   - Generate short redirect URLs for click tracking
   - Compose a concise SMS summary (max 1600 chars for Twilio)
   - Send the SMS via Twilio
   - Log results

## Scheduling

Set up a cron job to run daily at 8:00 AM CT:
```bash
0 8 * * * cd /path/to/chiirl && bun run skills/broadcast/scripts/broadcast.ts
```

## SMS Format

```
Good morning, Alex, here's events we found for you today:

1. Tech Meetup - 6pm @ WeWork
   chi.irl/r/abc123

2. Jazz Night - 8pm @ Green Mill
   chi.irl/r/def456

Reply STOP to unsubscribe.
```
