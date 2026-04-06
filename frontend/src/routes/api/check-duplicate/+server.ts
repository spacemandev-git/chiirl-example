import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	const { title, start_time } = await request.json();
	if (!title) return json([], { status: 200 });

	// Search for events with similar title within 1 day of the given start time
	const words = title.trim().split(/\s+/).slice(0, 5);
	const pattern = `%${words.join('%')}%`;

	let events;
	if (start_time) {
		const date = new Date(start_time);
		events = await sql`
			SELECT id, title, start_time
			FROM events
			WHERE title ILIKE ${pattern}
			  AND start_time BETWEEN ${new Date(date.getTime() - 86400000)} AND ${new Date(date.getTime() + 86400000)}
			LIMIT 5
		`;
	} else {
		events = await sql`
			SELECT id, title, start_time
			FROM events
			WHERE title ILIKE ${pattern}
			LIMIT 5
		`;
	}

	return json(
		events.map((e: any) => ({
			id: e.id,
			title: e.title,
			start_time: e.start_time.toISOString(),
		}))
	);
};
