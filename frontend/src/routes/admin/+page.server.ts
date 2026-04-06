import type { Actions, PageServerLoad } from './$types';
import sql from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.isAdmin) {
		return { authenticated: false, events: [], stats: null };
	}

	const [events, totalClicks, clicksByEvent, clicksByUser, clicksByDay, clicksBySource, userCount, eventCount] = await Promise.all([
		// Pending events
		sql`
			SELECT e.id, e.title, e.description, e.url, e.start_time, e.end_time, e.location, e.tags, e.status, e.created_at,
			       u.name as submitted_by_name, u.email as submitted_by_email
			FROM events e
			LEFT JOIN users u ON e.submitted_by = u.id
			WHERE e.status = 'pending'
			ORDER BY e.created_at DESC
		`,

		// Total clicks (all time + last 7 days + last 30 days)
		sql`
			SELECT
				COUNT(*) as total,
				COUNT(*) FILTER (WHERE clicked_at >= NOW() - INTERVAL '7 days') as last_7d,
				COUNT(*) FILTER (WHERE clicked_at >= NOW() - INTERVAL '30 days') as last_30d,
				COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users
			FROM clicks
		`,

		// Top clicked events (last 30 days)
		sql`
			SELECT e.id, e.title, e.start_time, e.tags,
				COUNT(*) as click_count,
				COUNT(DISTINCT c.user_id) FILTER (WHERE c.user_id IS NOT NULL) as unique_clickers
			FROM clicks c
			JOIN events e ON c.event_id = e.id
			WHERE c.clicked_at >= NOW() - INTERVAL '30 days'
			GROUP BY e.id, e.title, e.start_time, e.tags
			ORDER BY click_count DESC
			LIMIT 15
		`,

		// Most active users (last 30 days)
		sql`
			SELECT u.id, u.email, u.name,
				COUNT(*) as click_count,
				COUNT(DISTINCT c.event_id) as events_clicked,
				MAX(c.clicked_at) as last_click
			FROM clicks c
			JOIN users u ON c.user_id = u.id
			WHERE c.clicked_at >= NOW() - INTERVAL '30 days'
			GROUP BY u.id, u.email, u.name
			ORDER BY click_count DESC
			LIMIT 20
		`,

		// Clicks per day (last 14 days)
		sql`
			SELECT DATE(clicked_at AT TIME ZONE 'America/Chicago') as day,
				COUNT(*) as clicks,
				COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users
			FROM clicks
			WHERE clicked_at >= NOW() - INTERVAL '14 days'
			GROUP BY day
			ORDER BY day ASC
		`,

		// Clicks by source
		sql`
			SELECT source, COUNT(*) as count
			FROM clicks
			WHERE clicked_at >= NOW() - INTERVAL '30 days'
			GROUP BY source
			ORDER BY count DESC
		`,

		// Total users
		sql`
			SELECT
				COUNT(*) as total,
				COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d,
				COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30d
			FROM users
		`,

		// Total events
		sql`
			SELECT
				COUNT(*) as total,
				COUNT(*) FILTER (WHERE status = 'approved') as approved,
				COUNT(*) FILTER (WHERE status = 'pending') as pending,
				COUNT(*) FILTER (WHERE status = 'rejected') as rejected
			FROM events
		`,
	]);

	return {
		authenticated: true,
		events: events.map((e: any) => ({
			...e,
			start_time: e.start_time.toISOString(),
			end_time: e.end_time?.toISOString() || null,
			created_at: e.created_at.toISOString(),
			tags: Array.isArray(e.tags) ? e.tags : [],
		})),
		stats: {
			clicks: {
				total: Number(totalClicks[0].total),
				last7d: Number(totalClicks[0].last_7d),
				last30d: Number(totalClicks[0].last_30d),
				uniqueUsers: Number(totalClicks[0].unique_users),
			},
			topEvents: clicksByEvent.map((e: any) => ({
				id: e.id,
				title: e.title,
				startTime: e.start_time.toISOString(),
				tags: Array.isArray(e.tags) ? e.tags : [],
				clickCount: Number(e.click_count),
				uniqueClickers: Number(e.unique_clickers),
			})),
			topUsers: clicksByUser.map((u: any) => ({
				id: u.id,
				email: u.email,
				name: u.name,
				clickCount: Number(u.click_count),
				eventsClicked: Number(u.events_clicked),
				lastClick: u.last_click.toISOString(),
			})),
			dailyClicks: clicksByDay.map((d: any) => ({
				day: d.day.toISOString().split('T')[0],
				clicks: Number(d.clicks),
				uniqueUsers: Number(d.unique_users),
			})),
			clickSources: clicksBySource.map((s: any) => ({
				source: s.source,
				count: Number(s.count),
			})),
			users: {
				total: Number(userCount[0].total),
				last7d: Number(userCount[0].last_7d),
				last30d: Number(userCount[0].last_30d),
			},
			events: {
				total: Number(eventCount[0].total),
				approved: Number(eventCount[0].approved),
				pending: Number(eventCount[0].pending),
				rejected: Number(eventCount[0].rejected),
			},
		},
	};
};

export const actions: Actions = {
	approve: async ({ request, locals }) => {
		if (!locals.user || !locals.isAdmin) return fail(401, { error: 'Unauthorized' });

		const form = await request.formData();
		const eventId = parseInt(form.get('event_id')?.toString() || '');
		if (isNaN(eventId)) return fail(400, { error: 'Invalid event ID' });

		await sql`UPDATE events SET status = 'approved' WHERE id = ${eventId}`;
		return { approved: eventId };
	},

	reject: async ({ request, locals }) => {
		if (!locals.user || !locals.isAdmin) return fail(401, { error: 'Unauthorized' });

		const form = await request.formData();
		const eventId = parseInt(form.get('event_id')?.toString() || '');
		if (isNaN(eventId)) return fail(400, { error: 'Invalid event ID' });

		await sql`UPDATE events SET status = 'rejected' WHERE id = ${eventId}`;
		return { rejected: eventId };
	},
};
