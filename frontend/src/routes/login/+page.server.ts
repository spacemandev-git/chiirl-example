import type { Actions, PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { createMagicLink, sendMagicLinkEmail, ensureUser } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/settings');
	return {};
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const form = await request.formData();
		const email = form.get('email')?.toString().trim().toLowerCase();

		if (!email || !email.includes('@')) {
			return fail(400, { error: 'Please enter a valid email address', email });
		}

		// Ensure user exists (creates if new)
		await ensureUser(email);

		// Create magic link token
		const token = await createMagicLink(email);

		// Send the email
		const origin = url.origin;
		const sent = await sendMagicLinkEmail(email, token, origin);

		if (!sent) {
			return fail(500, { error: 'Failed to send email. Please try again.', email });
		}

		return { sent: true, email };
	},
};
