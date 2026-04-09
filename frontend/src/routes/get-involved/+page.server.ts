import { fail } from '@sveltejs/kit';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import { getAdminEmails } from '$lib/server/auth';
import type { Actions } from './$types';

let _resend: Resend | null = null;
function getResend(): Resend {
	if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
	return _resend;
}

function escape(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

async function notifyAdmins(subject: string, fields: Record<string, string>) {
	const admins = getAdminEmails();
	if (admins.length === 0) {
		console.warn('No ADMIN_EMAILS configured; skipping notification');
		return;
	}

	const FROM_EMAIL = env.RESEND_FROM_EMAIL || 'events@chiirl.com';
	const html = `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;background:#0A0A0A;color:#F5F5F5;padding:24px;">
		<h2 style="color:#7BBCE0;">${escape(subject)}</h2>
		<table cellpadding="6" style="border-collapse:collapse;">
			${Object.entries(fields)
				.map(
					([k, v]) =>
						`<tr><td style="color:#888;text-transform:uppercase;font-size:11px;letter-spacing:0.08em;vertical-align:top;">${escape(k)}</td><td style="color:#F5F5F5;white-space:pre-wrap;">${escape(v)}</td></tr>`,
				)
				.join('')}
		</table>
	</body></html>`;

	const { error } = await getResend().emails.send({
		from: `chiirl <${FROM_EMAIL}>`,
		to: admins,
		subject,
		html,
	});

	if (error) {
		console.error('Failed to send notification:', error);
		throw new Error('Failed to send notification');
	}
}

export const actions: Actions = {
	volunteer: async ({ request }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim() ?? '';
		const email = (data.get('email') as string)?.trim() ?? '';
		const interests = (data.get('interests') as string)?.trim() ?? '';
		const message = (data.get('message') as string)?.trim() ?? '';

		if (!name || !email || !message) {
			return fail(400, { volunteer: { error: 'Name, email, and message are required.' } });
		}

		try {
			await notifyAdmins('New volunteer interest — chiirl', {
				Name: name,
				Email: email,
				Interests: interests || '(not specified)',
				Message: message,
			});
		} catch {
			return fail(500, { volunteer: { error: 'Could not send your message. Please try again.' } });
		}

		return { volunteer: { success: true } };
	},

	sponsor: async ({ request }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim() ?? '';
		const organization = (data.get('organization') as string)?.trim() ?? '';
		const email = (data.get('email') as string)?.trim() ?? '';
		const message = (data.get('message') as string)?.trim() ?? '';

		if (!name || !email || !organization || !message) {
			return fail(400, { sponsor: { error: 'All fields are required.' } });
		}

		try {
			await notifyAdmins('New sponsor inquiry — chiirl', {
				Name: name,
				Organization: organization,
				Email: email,
				Message: message,
			});
		} catch {
			return fail(500, { sponsor: { error: 'Could not send your message. Please try again.' } });
		}

		return { sponsor: { success: true } };
	},
};
