---
name: broadcast
description: Sends daily email digests and push notifications to subscribed users with relevant Chicago events based on their tag preferences. Uses Resend for email and web-push for PWA notifications.
compatibility: Requires Resend API key, VAPID keys, docker (postgres), bun, and internet access
allowed-tools: Bash(bun:*) Read
---

# Broadcast Skill

Sends personalized event digests to subscribed users via email and push notifications.

## Steps

1. Run the email broadcast:
   ```bash
   bun run skills/broadcast/scripts/broadcast.ts
   ```

2. Run push notifications:
   ```bash
   bun run skills/broadcast/scripts/push-notify.ts
   ```

3. The scripts will:
   - Query users based on their notification preferences
   - Find upcoming events matching their tag preferences
   - Send styled HTML email digests via Resend (with click-tracking links)
   - Send push notifications to PWA subscribers
   - Log results

## Scheduling

Both run automatically via the cron in `index.ts` at 8:00 AM CT daily.

## Email Format

Styled HTML email with:
- chiirl branding header
- Event cards with title, time, location, and tag pills
- Click-tracking redirect links (`/r/{userId}/{eventId}`)
- Unsubscribe/preferences link in footer
