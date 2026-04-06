import type { PageServerLoad } from './$types';
import sql from '$lib/server/db';

export const load: PageServerLoad = async ({ url }) => {
	const tags = url.searchParams.get('tags')?.split(',').filter(Boolean) || [];
	const range = url.searchParams.get('range') || 'upcoming';
	const q = url.searchParams.get('q') || '';

	const conditions: string[] = ["status = 'approved'"];
	const params: any[] = [];
	let paramIdx = 1;

	// Date range filtering
	const now = new Date();
	const chicagoNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));

	if (range === 'today') {
		const endOfDay = new Date(chicagoNow);
		endOfDay.setHours(23, 59, 59, 999);
		conditions.push(`start_time >= NOW() AND start_time <= $${paramIdx}`);
		params.push(endOfDay);
		paramIdx++;
	} else if (range === 'week') {
		const endOfWeek = new Date(chicagoNow);
		endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
		endOfWeek.setHours(23, 59, 59, 999);
		conditions.push(`start_time >= NOW() AND start_time <= $${paramIdx}`);
		params.push(endOfWeek);
		paramIdx++;
	} else if (range === 'weekend') {
		const dayOfWeek = chicagoNow.getDay();
		const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 0;
		const friday = new Date(chicagoNow);
		friday.setDate(friday.getDate() + daysUntilFriday);
		friday.setHours(17, 0, 0, 0);
		const sunday = new Date(friday);
		sunday.setDate(sunday.getDate() + 2);
		sunday.setHours(23, 59, 59, 999);
		conditions.push(`start_time >= $${paramIdx} AND start_time <= $${paramIdx + 1}`);
		params.push(friday, sunday);
		paramIdx += 2;
	} else {
		// upcoming: everything from now forward
		conditions.push('start_time >= NOW()');
	}

	// Tag filtering
	if (tags.length > 0) {
		conditions.push(`tags && $${paramIdx}::event_tag[]`);
		params.push(`{${tags.join(',')}}`);
		paramIdx++;
	}

	// Text search
	if (q) {
		conditions.push(`(title ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`);
		params.push(`%${q}%`);
		paramIdx++;
	}

	const where = conditions.join(' AND ');
	const query = `
		SELECT id, title, description, url, source, start_time, end_time, location, image_url, tags
		FROM events
		WHERE ${where}
		ORDER BY start_time ASC
		LIMIT 60
	`;

	const events = await sql.unsafe(query, params);

	return {
		events: events.map((e: any) => ({
			...e,
			start_time: e.start_time.toISOString(),
			end_time: e.end_time?.toISOString() || null,
			tags: Array.isArray(e.tags) ? e.tags : [],
		})),
		filters: { tags, range, q },
	};
};
