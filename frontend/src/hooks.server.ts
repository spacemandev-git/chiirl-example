import type { Handle } from '@sveltejs/kit';
import { resolveSession, getAdminEmails } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session');

	if (sessionToken) {
		const user = await resolveSession(sessionToken);
		event.locals.user = user;
		if (user) {
			const adminEmails = getAdminEmails();
			event.locals.isAdmin = adminEmails.includes(user.email.toLowerCase());
		} else {
			event.locals.isAdmin = false;
			// Expired/invalid session — clean up cookie
			event.cookies.delete('session', { path: '/' });
		}
	} else {
		event.locals.user = null;
		event.locals.isAdmin = false;
	}

	return resolve(event);
};
