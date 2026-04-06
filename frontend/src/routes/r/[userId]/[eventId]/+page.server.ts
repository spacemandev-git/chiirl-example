import type { PageServerLoad } from './$types';
import sql from '$lib/server/db';
import { redirect, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const userId = parseInt(params.userId);
	const eventId = parseInt(params.eventId);

	if (isNaN(userId) || isNaN(eventId)) error(404, 'Not found');

	const events = await sql`SELECT url FROM events WHERE id = ${eventId} LIMIT 1`;
	if (events.length === 0) error(404, 'Event not found');

	// Record the click with email source
	await sql`INSERT INTO clicks (user_id, event_id, source) VALUES (${userId}, ${eventId}, 'email')`;

	redirect(302, events[0].url);
};
