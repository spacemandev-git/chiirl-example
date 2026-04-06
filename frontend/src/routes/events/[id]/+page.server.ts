import type { PageServerLoad } from './$types';
import sql from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) error(404, 'Event not found');

	const events = await sql`
		SELECT id, title, description, url, source, source_id, start_time, end_time, location, image_url, tags, status, submitted_by
		FROM events WHERE id = ${id}
	`;

	if (events.length === 0) error(404, 'Event not found');

	const event = events[0];

	// Only show approved events, or pending events submitted by the current user
	if (event.status !== 'approved') {
		if (!locals.user || locals.user.id !== event.submitted_by) {
			error(404, 'Event not found');
		}
	}

	// Check if user has bookmarked
	let bookmarked = false;
	if (locals.user) {
		const bm = await sql`
			SELECT 1 FROM bookmarks WHERE user_id = ${locals.user.id} AND event_id = ${id}
		`;
		bookmarked = bm.length > 0;
	}

	return {
		event: {
			...event,
			start_time: event.start_time.toISOString(),
			end_time: event.end_time?.toISOString() || null,
			tags: Array.isArray(event.tags) ? event.tags : [],
		},
		bookmarked,
		loggedIn: !!locals.user,
	};
};

export const actions = {
	bookmark: async ({ params, locals }) => {
		if (!locals.user) return { error: 'Not logged in' };
		const eventId = parseInt(params.id);

		await sql`
			INSERT INTO bookmarks (user_id, event_id) VALUES (${locals.user.id}, ${eventId})
			ON CONFLICT (user_id, event_id) DO NOTHING
		`;
		return { bookmarked: true };
	},
	unbookmark: async ({ params, locals }) => {
		if (!locals.user) return { error: 'Not logged in' };
		const eventId = parseInt(params.id);

		await sql`DELETE FROM bookmarks WHERE user_id = ${locals.user.id} AND event_id = ${eventId}`;
		return { bookmarked: false };
	},
};
