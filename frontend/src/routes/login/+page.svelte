<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>Sign In - chiirl</title>
</svelte:head>

<div class="container login-page">
	<div class="login-card animate-in">
		{#if form?.sent}
			<div class="sent-state">
				<div class="sent-icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--chi-blue)" stroke-width="1.5" stroke-linecap="round">
						<rect x="2" y="4" width="20" height="16" rx="2" />
						<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
					</svg>
				</div>
				<h1>Check your email</h1>
				<p>We sent a sign-in link to <strong>{form.email}</strong></p>
				<p class="sent-hint">The link expires in 15 minutes. Check your spam folder if you don't see it.</p>
			</div>
		{:else}
			<div class="login-header">
				<div class="login-logo">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="var(--star-red)">
						<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
					</svg>
				</div>
				<h1>Sign in to chiirl</h1>
				<p>Enter your email to receive a magic link</p>
			</div>

			{#if form?.error}
				<div class="error-msg">{form.error}</div>
			{/if}

			<form method="POST" use:enhance>
				<div class="form-group">
					<label for="email">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						autofocus
						placeholder="you@example.com"
						value={form?.email ?? ''}
					/>
				</div>

				<button type="submit" class="btn btn-primary submit-btn">Send Magic Link</button>
			</form>

			<p class="login-note">No password needed. We'll email you a sign-in link.</p>
		{/if}
	</div>
</div>

<style>
	.login-page {
		display: flex;
		justify-content: center;
		padding: 80px 20px;
	}

	.login-card {
		width: 100%;
		max-width: 420px;
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 40px;
	}

	.login-header {
		margin-bottom: 28px;
	}

	.login-logo {
		margin-bottom: 16px;
	}

	.login-header h1 {
		font-size: 1.5rem;
		margin-bottom: 6px;
		color: var(--white);
	}

	.login-header p {
		color: var(--gray);
		font-size: 0.9rem;
	}

	.error-msg {
		background: rgba(230, 57, 70, 0.1);
		color: var(--star-red);
		padding: 10px 16px;
		border-radius: var(--radius-sm);
		font-size: 0.9rem;
		margin-bottom: 20px;
		border: 1px solid rgba(230, 57, 70, 0.2);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.submit-btn {
		width: 100%;
		padding: 14px;
		font-size: 0.9rem;
	}

	.login-note {
		font-size: 0.78rem;
		color: var(--gray-dark);
		text-align: center;
		margin-top: 16px;
		font-family: var(--font-mono);
	}

	/* Sent state */
	.sent-state {
		text-align: center;
		padding: 16px 0;
	}

	.sent-icon {
		margin-bottom: 20px;
	}

	.sent-state h1 {
		font-size: 1.4rem;
		margin-bottom: 12px;
		color: var(--white);
	}

	.sent-state p {
		color: var(--white-dim);
		font-size: 0.95rem;
	}

	.sent-state strong {
		color: var(--chi-blue);
	}

	.sent-hint {
		color: var(--gray) !important;
		font-size: 0.85rem !important;
		margin-top: 16px !important;
	}
</style>
