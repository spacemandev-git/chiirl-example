import Twilio from "twilio";
import db from "../../../src/db";
import type { EventTag } from "../../../src/types";

const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);
const FROM_PHONE = process.env.TWILIO_PHONE_NUMBER!;
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

interface UserRow {
  id: number;
  phone: string;
  name: string | null;
  tags: EventTag[];
}

interface EventRow {
  id: number;
  title: string;
  url: string;
  start_time: Date;
  location: string | null;
}

async function getSubscribedUsers(): Promise<UserRow[]> {
  const rows = await db`
    SELECT id, phone, name, tags FROM users WHERE subscribed = true
  `;
  return rows as unknown as UserRow[];
}

async function getEventsForTags(tags: EventTag[] | string): Promise<EventRow[]> {
  // tags may come back from Postgres as a string like "{tech,social}"
  const tagStr = Array.isArray(tags) ? `{${tags.join(",")}}` : String(tags);
  if (tagStr === "{}" || !tagStr) return [];

  const rows = await db`
    SELECT id, title, url, start_time, location
    FROM events
    WHERE start_time >= NOW()
      AND start_time < NOW() + INTERVAL '2 days'
      AND tags && ${tagStr}
    ORDER BY start_time ASC
    LIMIT 10
  `;
  return rows as unknown as EventRow[];
}

function redirectUrl(userId: number, eventId: number): string {
  return `${BASE_URL}/r/${userId}/${eventId}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
  });
}

async function composeSMS(user: UserRow, events: EventRow[]): Promise<string> {
  const name = user.name || "friend";
  const lines: string[] = [`Good morning, ${name}, here's events we found for you today:\n`];

  for (let i = 0; i < events.length; i++) {
    const evt = events[i]!;
    const link = redirectUrl(user.id, evt.id);
    const time = formatTime(new Date(evt.start_time));
    const loc = evt.location ? ` @ ${evt.location.split(",")[0]}` : "";
    lines.push(`${i + 1}. ${evt.title} - ${time}${loc}`);
    lines.push(`   ${link}\n`);
  }

  lines.push("Reply STOP to unsubscribe.");

  // Trim to fit SMS limits
  let msg = lines.join("\n");
  if (msg.length > 1550) {
    msg = msg.slice(0, 1547) + "...";
  }
  return msg;
}

async function sendSMS(to: string, body: string): Promise<boolean> {
  try {
    await twilioClient.messages.create({
      to,
      from: FROM_PHONE,
      body,
    });
    return true;
  } catch (err) {
    console.error(`  Failed to send SMS to ${to}:`, err);
    return false;
  }
}

async function main() {
  console.log("Starting daily broadcast...\n");

  const users = await getSubscribedUsers();
  console.log(`Found ${users.length} subscribed users`);

  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    const events = await getEventsForTags(user.tags);

    if (events.length === 0) {
      console.log(`  ${user.phone}: No matching events, skipping`);
      skipped++;
      continue;
    }

    const message = await composeSMS(user, events);
    const success = await sendSMS(user.phone, message);

    if (success) {
      console.log(`  ${user.phone}: Sent ${events.length} events`);
      sent++;
    }
  }

  console.log(`\nBroadcast complete: ${sent} sent, ${skipped} skipped`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Broadcast failed:", err);
  process.exit(1);
});
