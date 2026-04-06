import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { eventId } = await request.json();
	if (!eventId) return json({ error: 'eventId required' }, { status: 400 });

	await sql`
		INSERT INTO clicks (user_id, event_id, source)
		VALUES (${locals.user?.id ?? null}, ${eventId}, 'pwa')
	`;

	return json({ ok: true });
};
