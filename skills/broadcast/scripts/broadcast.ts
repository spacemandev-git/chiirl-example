import { Resend } from "resend";
import db from "../../../src/db";
import type { EventTag, DigestFrequency } from "../../../src/types";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "events@chiirl.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

interface UserRow {
  id: number;
  email: string;
  name: string | null;
  tags: EventTag[];
  email_frequency: DigestFrequency;
  last_email_digest_at: Date | null;
}

interface EventRow {
  id: number;
  title: string;
  url: string;
  start_time: Date;
  end_time: Date | null;
  location: string | null;
  image_url: string | null;
  tags: EventTag[];
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

async function getEmailSubscribers(): Promise<UserRow[]> {
  const rows = await db`
    SELECT id, email, name, tags, email_frequency, last_email_digest_at FROM users
    WHERE email_frequency != 'none'
  `;
  return rows as unknown as UserRow[];
}

export async function getEventsForTags(tags: EventTag[] | string): Promise<EventRow[]> {
  const tagStr = Array.isArray(tags) ? `{${tags.join(",")}}` : String(tags);
  if (tagStr === "{}" || !tagStr) return [];

  const rows = await db`
    SELECT id, title, url, start_time, end_time, location, image_url, tags
    FROM events
    WHERE start_time >= NOW()
      AND start_time < NOW() + INTERVAL '2 days'
      AND status = 'approved'
      AND tags && ${tagStr}
    ORDER BY start_time ASC
    LIMIT 10
  `;
  return rows as unknown as EventRow[];
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
  });
}

function trackingUrl(userId: number, eventId: number): string {
  return `${FRONTEND_URL}/r/${userId}/${eventId}`;
}

const TAG_COLORS: Record<string, string> = {
  "co-working": "#E8A838",
  "discussion": "#9B59B6",
  "hangout": "#F0A830",
  "networking": "#3498DB",
  "pitching-demo": "#E63946",
  "speaker-panel": "#C41E3A",
  "branding": "#E67E22",
  "business-strategy": "#4682B4",
  "capital-deployment": "#27AE60",
  "code-engineering": "#4A9ED6",
  "finance": "#2ECC71",
  "fundraising": "#E74C3C",
  "gtm": "#1ABC9C",
  "legal-ip": "#8E44AD",
  "marketing": "#3DAEE0",
  "org-management": "#D4A017",
  "recruiting": "#27D17F",
  "product": "#A86ED6",
  "pitching-howto": "#E57373",
  "policy": "#7F8C8D",
  "sales": "#C0392B",
  "scaling": "#16A085",
  "uiux-cx": "#AF7AC5",
};

export function composeEmailHTML(user: UserRow, events: EventRow[]): string {
  const name = user.name || "friend";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  });

  const eventCards = events
    .map((evt) => {
      const tags = (Array.isArray(evt.tags) ? evt.tags : [])
        .map(
          (t) =>
            `<span style="display:inline-block;padding:3px 10px;border-radius:2px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;background:${TAG_COLORS[t] || "#888"};color:#fff;margin-right:4px;">${t}</span>`
        )
        .join("");

      const loc = evt.location ? evt.location.split(",")[0] : "";
      const time = formatDateTime(new Date(evt.start_time));
      const link = trackingUrl(user.id, evt.id);

      return `
        <tr><td style="padding:8px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:8px;overflow:hidden;">
            <tr><td style="padding:16px 20px;">
              <div style="font-family:'SF Mono','Courier New',monospace;font-size:11px;font-weight:700;color:#E63946;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">&#9733; ${time}</div>
              <a href="${link}" style="color:#F5F5F5;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;font-size:17px;font-weight:800;line-height:1.25;letter-spacing:-0.03em;">${evt.title}</a>
              ${loc ? `<div style="margin-top:6px;font-family:'SF Mono','Courier New',monospace;font-size:12px;color:#888;">${loc}</div>` : ""}
              <div style="margin-top:10px;">${tags}</div>
            </td></tr>
          </table>
        </td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <!-- Header -->
        <tr><td style="padding-bottom:24px;">
          <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.12em;border:1px solid #333;border-radius:2px;padding:4px 14px;display:inline-block;">&#9733; Chicago Events</span>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding-bottom:8px;">
          <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:28px;font-weight:800;color:#7BBCE0;letter-spacing:-0.03em;line-height:1;">Good morning,</span>
        </td></tr>
        <tr><td style="padding-bottom:8px;">
          <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:28px;font-weight:800;color:#F5F5F5;letter-spacing:-0.03em;line-height:1;">${name}</span>
        </td></tr>
        <tr><td style="padding-bottom:24px;">
          <span style="font-size:14px;color:#888;">${today} &mdash; here's what's happening in Chicago</span>
        </td></tr>

        <!-- Events -->
        ${eventCards}

        <!-- Browse more -->
        <tr><td style="padding:24px 0;text-align:center;">
          <a href="${FRONTEND_URL}" style="display:inline-block;padding:10px 24px;background:#E63946;color:#fff;text-decoration:none;border-radius:4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Browse All Events</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:24px;border-top:1px solid #2A2A2A;font-size:12px;color:#555;text-align:center;">
          <a href="${FRONTEND_URL}/settings" style="color:#888;text-decoration:none;text-transform:uppercase;letter-spacing:0.04em;font-size:11px;font-weight:600;">Update preferences</a>
          <span style="color:#333;margin:0 8px;">|</span>
          <a href="${FRONTEND_URL}/settings" style="color:#888;text-decoration:none;text-transform:uppercase;letter-spacing:0.04em;font-size:11px;font-weight:600;">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: `chiirl <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
    });
    if (error) {
      console.error(`  Failed to send to ${to}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`  Failed to send to ${to}:`, err);
    return false;
  }
}

export async function broadcast() {
  console.log("Starting daily email broadcast...\n");

  const users = await getEmailSubscribers();
  console.log(`Found ${users.length} email subscribers`);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "America/Chicago",
  });

  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    if (!isDue(user.email_frequency, user.last_email_digest_at)) {
      console.log(`  ${user.email}: Not due (${user.email_frequency}), skipping`);
      skipped++;
      continue;
    }

    const events = await getEventsForTags(user.tags);

    if (events.length === 0) {
      console.log(`  ${user.email}: No matching events, skipping`);
      skipped++;
      continue;
    }

    const html = composeEmailHTML(user, events);
    const subject = `Your Chicago Events for ${today}`;
    const success = await sendEmail(user.email, subject, html);

    if (success) {
      console.log(`  ${user.email}: Sent ${events.length} events`);
      await db`UPDATE users SET last_email_digest_at = NOW() WHERE id = ${user.id}`;
      sent++;
    }
  }

  console.log(`\nBroadcast complete: ${sent} sent, ${skipped} skipped`);
}

// Allow running directly
if (import.meta.main) {
  broadcast()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Broadcast failed:", err);
      process.exit(1);
    });
}
