import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Not logged in' }, { status: 401 });

	const { endpoint, p256dh, auth } = await request.json();
	if (!endpoint || !p256dh || !auth) {
		return json({ error: 'Missing subscription data' }, { status: 400 });
	}

	await sql`
		INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
		VALUES (${locals.user.id}, ${endpoint}, ${p256dh}, ${auth})
		ON CONFLICT (endpoint) DO UPDATE SET
			user_id = ${locals.user.id},
			p256dh = ${p256dh},
			auth = ${auth}
	`;

	return json({ ok: true });
};
