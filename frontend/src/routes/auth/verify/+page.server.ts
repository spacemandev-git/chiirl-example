import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { verifyToken, createSession, ensureUser } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url, cookies }) => {
	const token = url.searchParams.get('token');
	if (!token) error(400, 'Missing token');

	const email = await verifyToken(token);
	if (!email) error(400, 'Invalid or expired link. Please request a new one.');

	// Ensure user exists and get their ID
	const userId = await ensureUser(email);

	// Create session
	const sessionToken = await createSession(userId);

	cookies.set('session', sessionToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: url.protocol === 'https:',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	});

	redirect(303, '/');
};
