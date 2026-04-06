import type { Actions, PageServerLoad } from './$types';
import sql from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/auth';

const VALID_FREQUENCIES = ['daily', 'weekly', 'monthly', 'none'];

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');

	return {
		user: {
			...locals.user,
			tags: Array.isArray(locals.user.tags) ? locals.user.tags : [],
		},
	};
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not logged in' });

		const form = await request.formData();
		const name = form.get('name')?.toString().trim() || null;
		const tags = form.getAll('tags').map((t) => t.toString());
		const emailFreq = form.get('email_frequency')?.toString() || 'daily';
		const pushFreq = form.get('push_frequency')?.toString() || 'none';
		const tagStr = tags.length > 0 ? `{${tags.join(',')}}` : '{}';

		if (!VALID_FREQUENCIES.includes(emailFreq) || !VALID_FREQUENCIES.includes(pushFreq)) {
			return fail(400, { error: 'Invalid frequency' });
		}

		// Derive legacy notification_preference from new fields
		const hasEmail = emailFreq !== 'none';
		const hasPush = pushFreq !== 'none';
		const notifPref = hasEmail && hasPush ? 'both' : hasEmail ? 'email' : hasPush ? 'push' : 'none';

		await sql`
			UPDATE users SET
				name = ${name},
				tags = ${tagStr}::event_tag[],
				notification_preference = ${notifPref}::notification_preference,
				email_frequency = ${emailFreq}::digest_frequency,
				push_frequency = ${pushFreq}::digest_frequency
			WHERE id = ${locals.user.id}
		`;

		return { success: true };
	},

	logout: async ({ cookies }) => {
		const sessionToken = cookies.get('session');
		if (sessionToken) await deleteSession(sessionToken);
		cookies.delete('session', { path: '/' });
		redirect(303, '/');
	},

	delete: async ({ locals, cookies }) => {
		if (!locals.user) redirect(303, '/');

		const sessionToken = cookies.get('session');
		if (sessionToken) await deleteSession(sessionToken);
		await sql`DELETE FROM users WHERE id = ${locals.user.id}`;
		cookies.delete('session', { path: '/' });
		redirect(303, '/');
	},
};
