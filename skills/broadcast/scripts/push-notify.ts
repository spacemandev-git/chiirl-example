import webpush from "web-push";
import db from "../../../src/db";
import type { EventTag, DigestFrequency } from "../../../src/types";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:admin@chiirl.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

interface UserRow {
  id: number;
  name: string | null;
  tags: EventTag[];
  push_frequency: DigestFrequency;
  last_push_digest_at: Date | null;
}

interface SubRow {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface EventRow {
  id: number;
  title: string;
  start_time: Date;
  location: string | null;
}

function isDue(frequency: DigestFrequency, lastSentAt: Date | null): boolean {
  if (frequency === "none") return false;
  if (!lastSentAt) return true;
  const now = Date.now();
  const elapsed = now - new Date(lastSentAt).getTime();
  const DAY = 24 * 60 * 60 * 1000;
  if (frequency === "daily") return elapsed >= DAY;
  if (frequency === "weekly") return elapsed >= 7 * DAY;
  if (frequency === "monthly") return elapsed >= 28 * DAY;
  return false;
}

async function getPushUsers(): Promise<UserRow[]> {
  const rows = await db`
    SELECT id, name, tags, push_frequency, last_push_digest_at FROM users
    WHERE push_frequency != 'none'
  `;
  return rows as unknown as UserRow[];
}

export async function getUserSubscriptions(userId: number): Promise<SubRow[]> {
  const rows = await db`
    SELECT id, endpoint, p256dh, auth FROM push_subscriptions
    WHERE user_id = ${userId}
  `;
  return rows as unknown as SubRow[];
}

export async function getEventsForTags(tags: EventTag[] | string): Promise<EventRow[]> {
  const tagStr = Array.isArray(tags) ? `{${tags.join(",")}}` : String(tags);
  if (tagStr === "{}" || !tagStr) return [];

  const rows = await db`
    SELECT id, title, start_time, location
    FROM events
    WHERE start_time >= NOW()
      AND start_time < NOW() + INTERVAL '2 days'
      AND status = 'approved'
      AND tags && ${tagStr}
    ORDER BY start_time ASC
    LIMIT 5
  `;
  return rows as unknown as EventRow[];
}

async function removeSubscription(subId: number) {
  await db`DELETE FROM push_subscriptions WHERE id = ${subId}`;
}

export async function pushNotify() {
  console.log("Starting push notifications...\n");

  const users = await getPushUsers();
  console.log(`Found ${users.length} push-enabled users`);

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const user of users) {
    if (!isDue(user.push_frequency, user.last_push_digest_at)) {
      console.log(`  User ${user.id}: Not due (${user.push_frequency}), skipping`);
      skipped++;
      continue;
    }

    const events = await getEventsForTags(user.tags);
    if (events.length === 0) continue;

    const subs = await getUserSubscriptions(user.id);
    if (subs.length === 0) continue;

    const payload = JSON.stringify({
      title: `${events.length} events for you today`,
      body: events
        .slice(0, 3)
        .map((e) => e.title)
        .join(", "),
      url: FRONTEND_URL,
      icon: `${FRONTEND_URL}/icon-192.png`,
    });

    let userSent = false;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent++;
        userSent = true;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`  Removing expired subscription ${sub.id}`);
          await removeSubscription(sub.id);
        } else {
          console.error(`  Push failed for sub ${sub.id}:`, err.message);
        }
        failed++;
      }
    }

    if (userSent) {
      await db`UPDATE users SET last_push_digest_at = NOW() WHERE id = ${user.id}`;
    }
  }

  console.log(`\nPush complete: ${sent} sent, ${failed} failed, ${skipped} skipped`);
}

if (import.meta.main) {
  pushNotify()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Push notify failed:", err);
      process.exit(1);
    });
}
