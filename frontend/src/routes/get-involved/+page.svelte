<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();

	let volunteerSubmitting = $state(false);
	let sponsorSubmitting = $state(false);
</script>

<svelte:head>
	<title>Become a Volunteer or Sponsor - chiirl</title>
</svelte:head>

<section class="page-hero">
	<div class="container">
		<div class="hero-badge">
			<svg width="10" height="10" viewBox="0 0 24 24" fill="var(--star-red)">
				<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
			</svg>
			<span>Get Involved</span>
		</div>
		<h1 class="page-title">Become a Volunteer<br /><span class="accent">or Sponsor</span></h1>
		<p class="page-sub">Help us build Chicago's tech community</p>
	</div>
</section>

<section class="content-section">
	<div class="container narrow">
		<article class="block" id="volunteer">
			<h2 class="block-title">Become a Volunteer</h2>
			<p class="block-text">
				Get to know peers who become friends — you will never be alone at an event! Get on the
				Discord to take part in discussions and share your expertise and enthusiasm. Help this
				organization thrive so our tech ecosystem can become a more open and inclusive community.
				Create projects to put on your résumé and show off your skills to colleagues.
			</p>
			<p class="block-text">
				On the form below, please specify your interest in volunteering for the Chi-IRL team. You
				can also help with a couple of other ongoing CTC programs — which you can find out about
				in the footer link.
			</p>

			{#if form?.volunteer?.success}
				<div class="flash flash-success">
					Thank you for your interest! We'll be in touch soon.
				</div>
			{:else}
				{#if form?.volunteer?.error}
					<div class="flash flash-error">{form.volunteer.error}</div>
				{/if}
				<form
					method="POST"
					action="?/volunteer"
					class="contact-form"
					use:enhance={() => {
						volunteerSubmitting = true;
						return async ({ update }) => {
							await update();
							volunteerSubmitting = false;
						};
					}}
				>
					<div class="field">
						<label for="v-name">Name</label>
						<input id="v-name" name="name" type="text" required />
					</div>
					<div class="field">
						<label for="v-email">Email</label>
						<input id="v-email" name="email" type="email" required />
					</div>
					<div class="field">
						<label for="v-interests">Areas of interest</label>
						<input
							id="v-interests"
							name="interests"
							type="text"
							placeholder="e.g. engineering, design, community, events"
						/>
					</div>
					<div class="field">
						<label for="v-message">How would you like to help?</label>
						<textarea id="v-message" name="message" rows="5" required></textarea>
					</div>
					<button type="submit" class="submit-btn" disabled={volunteerSubmitting}>
						{volunteerSubmitting ? 'Sending…' : 'Submit'}
					</button>
				</form>
			{/if}
		</article>

		<article class="block" id="sponsor">
			<h2 class="block-title">Become a Sponsor</h2>
			<p class="block-text">
				Be one of the first organizations that ecosystem newcomers get to know! Build your brand
				as entrepreneurship-positive and a Chicago tech leader. Please submit the form below to
				let us know how you'd like to support.
			</p>

			{#if form?.sponsor?.success}
				<div class="flash flash-success">
					Thank you for your interest! We'll be in touch soon.
				</div>
			{:else}
				{#if form?.sponsor?.error}
					<div class="flash flash-error">{form.sponsor.error}</div>
				{/if}
				<form
					method="POST"
					action="?/sponsor"
					class="contact-form"
					use:enhance={() => {
						sponsorSubmitting = true;
						return async ({ update }) => {
							await update();
							sponsorSubmitting = false;
						};
					}}
				>
					<div class="field">
						<label for="s-name">Your name</label>
						<input id="s-name" name="name" type="text" required />
					</div>
					<div class="field">
						<label for="s-org">Organization</label>
						<input id="s-org" name="organization" type="text" required />
					</div>
					<div class="field">
						<label for="s-email">Email</label>
						<input id="s-email" name="email" type="email" required />
					</div>
					<div class="field">
						<label for="s-message">How would you like to support?</label>
						<textarea id="s-message" name="message" rows="5" required></textarea>
					</div>
					<button type="submit" class="submit-btn" disabled={sponsorSubmitting}>
						{sponsorSubmitting ? 'Sending…' : 'Submit'}
					</button>
				</form>
			{/if}
		</article>

		<p class="thanks">Thank you for your interest!</p>
	</div>
</section>

<style>
	.page-hero {
		padding: 72px 0 32px;
		text-align: center;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 14px;
		border: 1px solid var(--border-light);
		border-radius: 2px;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--gray);
		margin-bottom: 20px;
	}

	.page-title {
		font-size: clamp(2.2rem, 5.5vw, 3.6rem);
		line-height: 1.05;
		margin-bottom: 16px;
		color: var(--white);
	}

	.accent {
		color: var(--chi-blue);
	}

	.page-sub {
		font-size: 1rem;
		color: var(--gray);
	}

	.content-section {
		padding: 32px 0 80px;
	}

	.narrow {
		max-width: 720px;
	}

	.block {
		margin-bottom: 64px;
	}

	.block-title {
		font-size: clamp(1.5rem, 3.5vw, 2rem);
		color: var(--white);
		margin-bottom: 20px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--border);
	}

	.block-text {
		font-size: 1.02rem;
		line-height: 1.7;
		color: var(--gray);
		margin-bottom: 16px;
	}

	.contact-form {
		margin-top: 28px;
		display: flex;
		flex-direction: column;
		gap: 18px;
		padding: 28px;
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field label {
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--gray);
	}

	.field input,
	.field textarea {
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm, 4px);
		padding: 10px 12px;
		font-size: 0.95rem;
		color: var(--white);
		font-family: inherit;
		transition: border-color 0.15s ease;
	}

	.field input:focus,
	.field textarea:focus {
		outline: none;
		border-color: var(--chi-blue);
	}

	.field textarea {
		resize: vertical;
		min-height: 120px;
	}

	.submit-btn {
		align-self: flex-start;
		padding: 10px 24px;
		background: var(--star-red);
		color: #fff;
		border: none;
		border-radius: 4px;
		font-size: 0.82rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.submit-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.flash {
		margin-top: 20px;
		padding: 16px 20px;
		border-radius: var(--radius-md);
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.flash-success {
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.4);
		color: #86efac;
	}

	.flash-error {
		background: rgba(229, 62, 62, 0.1);
		border: 1px solid rgba(229, 62, 62, 0.4);
		color: #fca5a5;
		margin-top: 20px;
	}

	.thanks {
		text-align: center;
		font-size: 1.05rem;
		color: var(--chi-blue);
		font-style: italic;
		margin-top: 48px;
	}

	@media (max-width: 640px) {
		.page-hero {
			padding: 48px 0 24px;
		}

		.contact-form {
			padding: 20px;
		}
	}
</style>
