import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import webpush from 'web-push';

let _resend: Resend | null = null;
function getResend(): Resend {
	if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
	return _resend;
}

function initVapid() {
	if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
		webpush.setVapidDetails(
			env.VAPID_SUBJECT || 'mailto:admin@chiirl.com',
			env.VAPID_PUBLIC_KEY,
			env.VAPID_PRIVATE_KEY
		);
	}
}

const TAG_COLORS: Record<string, string> = {
	'co-working': '#E8A838',
	discussion: '#9B59B6',
	hangout: '#F0A830',
	networking: '#3498DB',
	'pitching-demo': '#E63946',
	'speaker-panel': '#C41E3A',
	branding: '#E67E22',
	'business-strategy': '#4682B4',
	'capital-deployment': '#27AE60',
	'code-engineering': '#4A9ED6',
	finance: '#2ECC71',
	fundraising: '#E74C3C',
	gtm: '#1ABC9C',
	'legal-ip': '#8E44AD',
	marketing: '#3DAEE0',
	'org-management': '#D4A017',
	recruiting: '#27D17F',
	product: '#A86ED6',
	'pitching-howto': '#E57373',
	policy: '#7F8C8D',
	sales: '#C0392B',
	scaling: '#16A085',
	'uiux-cx': '#AF7AC5',
};

function formatDateTime(date: Date): string {
	return new Date(date).toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZone: 'America/Chicago',
	});
}

interface EventRow {
	id: number;
	title: string;
	url: string;
	start_time: Date;
	end_time: Date | null;
	location: string | null;
	image_url: string | null;
	tags: string[];
}

async function getEventsForUser(tags: string[]): Promise<EventRow[]> {
	const tagStr = tags.length > 0 ? `{${tags.join(',')}}` : '{}';
	if (tagStr === '{}') return [];

	const rows = await sql`
		SELECT id, title, url, start_time, end_time, location, image_url, tags
		FROM events
		WHERE start_time >= NOW()
		  AND start_time < NOW() + INTERVAL '7 days'
		  AND status = 'approved'
		  AND tags && ${tagStr}
		ORDER BY start_time ASC
		LIMIT 10
	`;
	return rows as unknown as EventRow[];
}

function composeTestEmailHTML(
	name: string,
	events: EventRow[],
	frontendUrl: string
): string {
	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		timeZone: 'America/Chicago',
	});

	const eventCards = events
		.map((evt) => {
			const tags = (Array.isArray(evt.tags) ? evt.tags : [])
				.map(
					(t) =>
						`<span style="display:inline-block;padding:3px 10px;border-radius:2px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;background:${TAG_COLORS[t] || '#888'};color:#fff;margin-right:4px;">${t}</span>`
				)
				.join('');

			const loc = evt.location ? evt.location.split(',')[0] : '';
			const time = formatDateTime(new Date(evt.start_time));

			return `
        <tr><td style="padding:8px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:8px;overflow:hidden;">
            <tr><td style="padding:16px 20px;">
              <div style="font-family:'SF Mono','Courier New',monospace;font-size:11px;font-weight:700;color:#E63946;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">&#9733; ${time}</div>
              <a href="${evt.url}" style="color:#F5F5F5;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;font-size:17px;font-weight:800;line-height:1.25;letter-spacing:-0.03em;">${evt.title}</a>
              ${loc ? `<div style="margin-top:6px;font-family:'SF Mono','Courier New',monospace;font-size:12px;color:#888;">${loc}</div>` : ''}
              <div style="margin-top:10px;">${tags}</div>
            </td></tr>
          </table>
        </td></tr>`;
		})
		.join('');

	return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding-bottom:24px;">
          <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.12em;border:1px solid #333;border-radius:2px;padding:4px 14px;display:inline-block;">&#9733; Test Digest</span>
        </tr></td>
        <tr><td style="padding-bottom:8px;">
          <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:28px;font-weight:800;color:#7BBCE0;letter-spacing:-0.03em;line-height:1;">Good morning,</span>
        </td></tr>
        <tr><td style="padding-bottom:8px;">
          <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:28px;font-weight:800;color:#F5F5F5;letter-spacing:-0.03em;line-height:1;">${name}</span>
        </td></tr>
        <tr><td style="padding-bottom:24px;">
          <span style="font-size:14px;color:#888;">${today} &mdash; here's what's happening in Chicago</span>
        </td></tr>
        ${eventCards}
        <tr><td style="padding:24px 0;text-align:center;">
          <a href="${frontendUrl}" style="display:inline-block;padding:10px 24px;background:#E63946;color:#fff;text-decoration:none;border-radius:4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Browse All Events</a>
        </td></tr>
        <tr><td style="padding-top:24px;border-top:1px solid #2A2A2A;font-size:11px;color:#555;text-align:center;">
          This is a test digest. Your actual digest frequency is configured in your settings.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) throw error(401, 'Not logged in');

	const { channel } = await request.json();
	if (channel !== 'email' && channel !== 'push') {
		throw error(400, 'channel must be "email" or "push"');
	}

	// Rate limit: once per day
	if (locals.user.last_test_digest_at) {
		const lastTest = new Date(locals.user.last_test_digest_at).getTime();
		const elapsed = Date.now() - lastTest;
		const DAY = 24 * 60 * 60 * 1000;
		if (elapsed < DAY) {
			const hoursLeft = Math.ceil((DAY - elapsed) / (60 * 60 * 1000));
			throw error(429, `You can send another test digest in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}`);
		}
	}

	const tags = Array.isArray(locals.user.tags) ? locals.user.tags : [];
	const events = await getEventsForUser(tags);

	if (events.length === 0) {
		throw error(404, 'No upcoming events match your tags. Try adding more interests.');
	}

	const FRONTEND_URL = env.ORIGIN || 'http://localhost:5173';
	const FROM_EMAIL = env.RESEND_FROM_EMAIL || 'events@chiirl.com';
	const name = locals.user.name || 'friend';

	if (channel === 'email') {
		const html = composeTestEmailHTML(name, events, FRONTEND_URL);
		const resend = getResend();
		const { error: sendErr } = await resend.emails.send({
			from: `chiirl <${FROM_EMAIL}>`,
			to: [locals.user.email],
			subject: '[Test] Your Chicago Events Digest',
			html,
		});
		if (sendErr) throw error(500, 'Failed to send test email');
	} else {
		initVapid();
		const subs = await sql`
			SELECT endpoint, p256dh, auth FROM push_subscriptions
			WHERE user_id = ${locals.user.id}
		`;
		if (subs.length === 0) {
			throw error(400, 'No push subscriptions found. Enable push notifications first.');
		}

		const payload = JSON.stringify({
			title: `[Test] ${events.length} events for you`,
			body: events.slice(0, 3).map((e) => e.title).join(', '),
			url: FRONTEND_URL,
			icon: `${FRONTEND_URL}/icon-192.png`,
		});

		for (const sub of subs) {
			await webpush.sendNotification(
				{ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
				payload
			);
		}
	}

	// Stamp rate limit
	await sql`UPDATE users SET last_test_digest_at = NOW() WHERE id = ${locals.user.id}`;

	return json({ ok: true, eventsCount: events.length });
};
