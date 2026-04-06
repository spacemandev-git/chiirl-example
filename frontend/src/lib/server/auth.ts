import { randomBytes } from 'node:crypto';
import sql from './db';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

let _resend: Resend | null = null;
function getResend(): Resend {
	if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
	return _resend;
}

export function generateToken(): string {
	return randomBytes(32).toString('base64url');
}

export function getAdminEmails(): string[] {
	return (env.ADMIN_EMAILS || '')
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
}

export async function createMagicLink(email: string): Promise<string> {
	const token = generateToken();
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

	await sql`
		INSERT INTO auth_tokens (email, token, expires_at)
		VALUES (${email.toLowerCase()}, ${token}, ${expiresAt})
	`;

	return token;
}

export async function sendMagicLinkEmail(email: string, token: string, origin: string): Promise<boolean> {
	const url = `${origin}/auth/verify?token=${token}`;
	const FROM_EMAIL = env.RESEND_FROM_EMAIL || 'events@chiirl.com';

	try {
		const { error } = await getResend().emails.send({
			from: `chiirl <${FROM_EMAIL}>`,
			to: [email],
			subject: 'Sign in to chiirl',
			html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;">
    <tr><td align="center" style="padding:48px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
        <tr><td style="padding-bottom:32px;">
          <span style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.12em;border:1px solid #333;border-radius:2px;padding:4px 14px;display:inline-block;">&#9733; chiirl</span>
        </td></tr>
        <tr><td style="padding-bottom:8px;">
          <span style="font-size:26px;font-weight:800;color:#7BBCE0;letter-spacing:-0.03em;line-height:1;">Sign in to</span>
        </td></tr>
        <tr><td style="padding-bottom:12px;">
          <span style="font-size:26px;font-weight:800;color:#F5F5F5;letter-spacing:-0.03em;line-height:1;">your account</span>
        </td></tr>
        <tr><td style="padding-bottom:28px;">
          <p style="font-size:14px;color:#888;margin:0;">Click the button below to sign in. This link expires in 15 minutes.</p>
        </td></tr>
        <tr><td style="padding-bottom:32px;">
          <a href="${url}" style="display:inline-block;padding:10px 24px;background:#E63946;color:#fff;text-decoration:none;border-radius:4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Sign In</a>
        </td></tr>
        <tr><td style="font-size:11px;color:#555;border-top:1px solid #2A2A2A;padding-top:20px;">
          If you didn't request this, you can safely ignore this email.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
		});

		if (error) {
			console.error('Failed to send magic link:', error);
			return false;
		}
		return true;
	} catch (err) {
		console.error('Failed to send magic link:', err);
		return false;
	}
}

export async function verifyToken(token: string): Promise<string | null> {
	const rows = await sql`
		SELECT email FROM auth_tokens
		WHERE token = ${token}
		  AND expires_at > NOW()
		  AND used_at IS NULL
		LIMIT 1
	`;

	if (rows.length === 0) return null;

	// Mark as used
	await sql`UPDATE auth_tokens SET used_at = NOW() WHERE token = ${token}`;

	return rows[0].email;
}

export async function createSession(userId: number): Promise<string> {
	const token = generateToken();
	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

	await sql`
		INSERT INTO sessions (user_id, token, expires_at)
		VALUES (${userId}, ${token}, ${expiresAt})
	`;

	return token;
}

export async function resolveSession(sessionToken: string): Promise<App.Locals['user']> {
	const rows = await sql`
		SELECT u.id, u.email, u.name, u.tags, u.notification_preference,
		       u.email_frequency, u.push_frequency, u.last_test_digest_at
		FROM sessions s
		JOIN users u ON s.user_id = u.id
		WHERE s.token = ${sessionToken}
		  AND s.expires_at > NOW()
		LIMIT 1
	`;

	if (rows.length === 0) return null;

	const u = rows[0];
	return {
		id: u.id,
		email: u.email,
		name: u.name,
		tags: Array.isArray(u.tags) ? u.tags : [],
		notification_preference: u.notification_preference,
		email_frequency: u.email_frequency || 'daily',
		push_frequency: u.push_frequency || 'none',
		last_test_digest_at: u.last_test_digest_at?.toISOString() || null,
	};
}

export async function deleteSession(sessionToken: string): Promise<void> {
	await sql`DELETE FROM sessions WHERE token = ${sessionToken}`;
}

export async function ensureUser(email: string): Promise<number> {
	const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
	if (existing.length > 0) return existing[0].id;

	const result = await sql`
		INSERT INTO users (email) VALUES (${email.toLowerCase()}) RETURNING id
	`;
	return result[0].id;
}
