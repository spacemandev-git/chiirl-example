<script lang="ts">
	import { enhance } from '$app/forms';
	import { EVENT_TAGS, TAG_COLORS } from '$lib/utils';

	let { data, form } = $props();

	let showDelete = $state(false);
	let emailFreq = $state(data.user.email_frequency);
	let pushFreq = $state(data.user.push_frequency);

	$effect(() => {
		emailFreq = data.user.email_frequency;
		pushFreq = data.user.push_frequency;
	});

	let testingEmail = $state(false);
	let testingPush = $state(false);
	let testMsg = $state('');

	const FREQ_OPTIONS = [
		{ value: 'daily', label: 'Daily' },
		{ value: 'weekly', label: 'Weekly' },
		{ value: 'monthly', label: 'Monthly' },
		{ value: 'none', label: 'Off' },
	];

	let selectedTags = $derived(data.user.tags);

	async function subscribePush() {
		if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
			alert('Push notifications are not supported in this browser');
			return;
		}

		const registration = await navigator.serviceWorker.ready;
		const permission = await Notification.requestPermission();
		if (permission !== 'granted') return;

		const vapidKey = document.querySelector('meta[name="vapid-key"]')?.getAttribute('content');
		if (!vapidKey) return;

		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: vapidKey,
		});

		const subJson = subscription.toJSON();
		await fetch('/api/subscribe-push', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				endpoint: subJson.endpoint,
				p256dh: subJson.keys?.p256dh,
				auth: subJson.keys?.auth,
			}),
		});
	}

	async function sendTestDigest(channel: 'email' | 'push') {
		if (channel === 'email') testingEmail = true;
		else testingPush = true;
		testMsg = '';

		try {
			const res = await fetch('/api/test-digest', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ channel }),
			});
			const body = await res.json();
			if (!res.ok) {
				testMsg = body.message || 'Failed to send test digest';
			} else {
				testMsg = channel === 'email'
					? `Test email sent with ${body.eventsCount} events!`
					: `Test push sent with ${body.eventsCount} events!`;
			}
		} catch {
			testMsg = 'Something went wrong';
		} finally {
			testingEmail = false;
			testingPush = false;
		}
	}
</script>

<svelte:head>
	<title>Settings - chiirl</title>
</svelte:head>

<div class="container settings-page">
	<div class="settings-card animate-in">
		<div class="settings-header">
			<h1>Settings</h1>
			<p class="settings-email">{data.user.email}</p>
		</div>

		{#if form?.success}
			<div class="success-msg">Preferences saved!</div>
		{/if}

		<!-- Current subscription summary -->
		<div class="subscription-summary">
			<h2 class="section-title">Your Digest</h2>
			<div class="summary-row">
				<span class="summary-label">Email</span>
				<span class="summary-value">
					{emailFreq === 'none' ? 'Off' : emailFreq.charAt(0).toUpperCase() + emailFreq.slice(1)}
				</span>
			</div>
			<div class="summary-row">
				<span class="summary-label">Push</span>
				<span class="summary-value">
					{pushFreq === 'none' ? 'Off' : pushFreq.charAt(0).toUpperCase() + pushFreq.slice(1)}
				</span>
			</div>
			<div class="summary-row">
				<span class="summary-label">Subscribed tags</span>
				<div class="summary-tags">
					{#if selectedTags.length === 0}
						<span class="no-tags">None selected</span>
					{:else}
						{#each selectedTags as tag (tag)}
							<span class="tag-pill tag-{tag}" style="--tag-color: {TAG_COLORS[tag]}">{tag}</span>
						{/each}
					{/if}
				</div>
			</div>
		</div>

		<form method="POST" action="?/update" use:enhance>
			<!-- Profile -->
			<fieldset class="settings-section">
				<h2 class="section-title">Profile</h2>
				<div class="form-group">
					<label for="name">Name</label>
					<input type="text" id="name" name="name" value={data.user.name ?? ''} placeholder="Your name" />
				</div>
			</fieldset>

			<!-- Interests -->
			<fieldset class="settings-section">
				<h2 class="section-title">Interests</h2>
				<p class="section-desc">Select the event categories you care about. Your digest will include events matching these tags.</p>
				<div class="tag-select">
					{#each EVENT_TAGS as tag (tag)}
						<label class="tag-option tag-{tag}" style="--tag-color: {TAG_COLORS[tag]}">
							<input type="checkbox" name="tags" value={tag} checked={data.user.tags.includes(tag)} />
							<span class="tag-label">{tag}</span>
						</label>
					{/each}
				</div>
			</fieldset>

			<!-- Email Frequency -->
			<fieldset class="settings-section">
				<h2 class="section-title">Email Digest</h2>
				<p class="section-desc">How often would you like to receive event digests by email?</p>
				<div class="freq-options">
					{#each FREQ_OPTIONS as opt (opt.value)}
						<label class="freq-option" class:active={emailFreq === opt.value}>
							<input
								type="radio"
								name="email_frequency"
								value={opt.value}
								checked={emailFreq === opt.value}
								onchange={() => emailFreq = opt.value}
							/>
							<span class="freq-label">{opt.label}</span>
						</label>
					{/each}
				</div>
			</fieldset>

			<!-- Push Frequency -->
			<fieldset class="settings-section">
				<h2 class="section-title">Push Notifications</h2>
				<p class="section-desc">How often would you like to receive push notification digests?</p>
				<div class="freq-options">
					{#each FREQ_OPTIONS as opt (opt.value)}
						<label class="freq-option" class:active={pushFreq === opt.value}>
							<input
								type="radio"
								name="push_frequency"
								value={opt.value}
								checked={pushFreq === opt.value}
								onchange={() => {
									pushFreq = opt.value;
									if (opt.value !== 'none') subscribePush();
								}}
							/>
							<span class="freq-label">{opt.label}</span>
						</label>
					{/each}
				</div>
			</fieldset>

			<button type="submit" class="btn btn-primary submit-btn">Save Changes</button>
		</form>

		<!-- Test Digest -->
		<div class="test-section">
			<h2 class="section-title">Test Digest</h2>
			<p class="section-desc">Send yourself a test digest to preview what it looks like. Limited to once per day.</p>
			{#if testMsg}
				<div class="test-msg">{testMsg}</div>
			{/if}
			<div class="test-buttons">
				<button
					class="btn btn-secondary"
					disabled={testingEmail || testingPush}
					onclick={() => sendTestDigest('email')}
				>
					{testingEmail ? 'Sending...' : 'Send Test Email'}
				</button>
				<button
					class="btn btn-secondary"
					disabled={testingEmail || testingPush}
					onclick={() => sendTestDigest('push')}
				>
					{testingPush ? 'Sending...' : 'Send Test Push'}
				</button>
			</div>
		</div>

		<!-- Install & Notifications Guide -->
		<div class="setup-guide">
			<h2 class="section-title">Get the App</h2>
			<p class="section-desc">Install chiirl on your device and enable notifications so you never miss an event.</p>

			<div class="guide-step">
				<span class="step-number">1</span>
				<div class="step-content">
					<h3 class="step-title">Install as App (PWA)</h3>
					<div class="step-instructions">
						<div class="platform-block">
							<span class="platform-label">iPhone / iPad</span>
							<p>Open chiirl in <strong>Safari</strong> &rarr; tap the <strong>Share</strong> button (square with arrow) &rarr; scroll down and tap <strong>"Add to Home Screen"</strong></p>
						</div>
						<div class="platform-block">
							<span class="platform-label">Android</span>
							<p>Open chiirl in <strong>Chrome</strong> &rarr; tap the <strong>three-dot menu</strong> &rarr; tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong></p>
						</div>
						<div class="platform-block">
							<span class="platform-label">Desktop (Chrome / Edge)</span>
							<p>Click the <strong>install icon</strong> in the address bar (or three-dot menu &rarr; <strong>"Install chiirl"</strong>)</p>
						</div>
					</div>
				</div>
			</div>

			<div class="guide-step">
				<span class="step-number">2</span>
				<div class="step-content">
					<h3 class="step-title">Enable Push Notifications</h3>
					<div class="step-instructions">
						<p>After installing, set your <strong>Push Notifications</strong> frequency above to Daily, Weekly, or Monthly. Your browser will ask permission to send notifications &mdash; tap <strong>"Allow"</strong>.</p>
						<div class="platform-block">
							<span class="platform-label">iPhone / iPad</span>
							<p>Requires <strong>iOS 16.4+</strong>. You <em>must</em> install the app to your Home Screen first &mdash; then open it from there and enable push notifications in settings above.</p>
						</div>
						<div class="platform-block">
							<span class="platform-label">Not getting notifications?</span>
							<p>Check your device's notification settings &rarr; make sure chiirl (or your browser) is allowed to send notifications. You can also tap <strong>"Send Test Push"</strong> above to verify.</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<hr class="divider" />

		<div class="danger-zone">
			<form method="POST" action="?/logout" use:enhance>
				<button type="submit" class="btn btn-secondary">Log Out</button>
			</form>

			{#if !showDelete}
				<button class="btn btn-ghost danger-text" onclick={() => showDelete = true}>
					Delete Account
				</button>
			{:else}
				<form method="POST" action="?/delete" use:enhance>
					<p class="danger-text" style="font-size: 0.8rem; margin-bottom: 8px;">This cannot be undone.</p>
					<button type="submit" class="btn btn-danger">Confirm Delete</button>
				</form>
			{/if}
		</div>
	</div>
</div>

<style>
	.settings-page {
		display: flex;
		justify-content: center;
		padding: 48px 20px;
	}

	.settings-card {
		width: 100%;
		max-width: 520px;
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 40px;
	}

	.settings-header {
		margin-bottom: 28px;
	}

	.settings-header h1 {
		font-size: 1.6rem;
		margin-bottom: 4px;
		color: var(--white);
	}

	.settings-email {
		color: var(--gray);
		font-size: 0.85rem;
		font-family: var(--font-mono);
	}

	.success-msg {
		background: rgba(22, 163, 74, 0.1);
		color: #2ECC71;
		padding: 10px 16px;
		border-radius: var(--radius-sm);
		font-size: 0.9rem;
		margin-bottom: 20px;
		border: 1px solid rgba(22, 163, 74, 0.2);
	}

	/* Subscription summary */
	.subscription-summary {
		background: var(--black-light);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 20px 24px;
		margin-bottom: 32px;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 8px 0;
	}

	.summary-row + .summary-row {
		border-top: 1px solid var(--border);
	}

	.summary-label {
		font-size: 0.75rem;
		color: var(--gray);
		font-weight: 700;
		flex-shrink: 0;
		margin-right: 16px;
		padding-top: 2px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.summary-value {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--white);
	}

	.summary-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		justify-content: flex-end;
	}

	.no-tags {
		font-size: 0.8rem;
		color: var(--gray-dark);
		font-style: italic;
	}

	/* Sections */
	.settings-section {
		border: none;
		padding: 0;
		margin: 0;
	}

	.section-title {
		font-size: 0.85rem;
		font-weight: 700;
		margin-bottom: 4px;
		color: var(--chi-blue);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.section-desc {
		font-size: 0.85rem;
		color: var(--gray);
		margin-bottom: 12px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 28px;
	}

	.tag-select {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.tag-option {
		cursor: pointer;
	}

	.tag-option input { display: none; }

	.tag-label {
		display: inline-block;
		padding: 5px 12px;
		border-radius: 2px;
		font-size: 0.75rem;
		font-weight: 700;
		border: 1.5px solid var(--border);
		color: var(--gray);
		transition: all 0.15s ease;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.tag-option input:checked + .tag-label {
		background: var(--tag-color);
		border-color: var(--tag-color);
		color: #fff;
	}

	.tag-label:hover {
		border-color: var(--tag-color);
		color: var(--tag-color);
	}

	/* Frequency options */
	.freq-options {
		display: flex;
		gap: 8px;
	}

	.freq-option {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10px 8px;
		border: 1.5px solid var(--border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.freq-option:hover {
		border-color: var(--border-light);
		background: var(--black-hover);
	}

	.freq-option.active {
		border-color: var(--chi-blue);
		background: rgba(123, 188, 224, 0.05);
	}

	.freq-option input {
		display: none;
	}

	.freq-label {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--gray);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.freq-option.active .freq-label {
		color: var(--chi-blue);
	}

	/* Test digest */
	.test-section {
		margin-top: 32px;
		padding-top: 28px;
		border-top: 1px solid var(--border);
	}

	.test-buttons {
		display: flex;
		gap: 8px;
	}

	.test-buttons .btn {
		flex: 1;
		font-size: 0.82rem;
		padding: 10px 16px;
	}

	.test-buttons .btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.test-msg {
		font-size: 0.85rem;
		color: var(--chi-blue);
		margin-bottom: 12px;
		padding: 8px 12px;
		border-radius: var(--radius-sm);
		background: rgba(123, 188, 224, 0.05);
		border: 1px solid rgba(123, 188, 224, 0.15);
	}

	.submit-btn {
		width: 100%;
		padding: 14px;
		font-size: 0.9rem;
	}

	.divider {
		border: none;
		border-top: 1px solid var(--border);
		margin: 32px 0;
	}

	/* Setup guide */
	.setup-guide {
		margin-top: 32px;
		padding-top: 28px;
		border-top: 1px solid var(--border);
	}

	.guide-step {
		display: flex;
		gap: 16px;
		margin-top: 20px;
	}

	.guide-step + .guide-step {
		margin-top: 24px;
		padding-top: 24px;
		border-top: 1px solid var(--border);
	}

	.step-number {
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--chi-blue);
		color: var(--black);
		font-size: 0.78rem;
		font-weight: 800;
	}

	.step-title {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--white);
		margin-bottom: 10px;
	}

	.step-instructions {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.step-instructions > p {
		font-size: 0.85rem;
		color: var(--gray);
		line-height: 1.5;
	}

	.platform-block {
		background: var(--black-light);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 12px 14px;
	}

	.platform-label {
		display: block;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--chi-blue);
		margin-bottom: 4px;
	}

	.platform-block p {
		font-size: 0.82rem;
		color: var(--gray);
		line-height: 1.5;
	}

	.platform-block strong {
		color: var(--white);
	}

	.platform-block em {
		color: var(--star-red);
		font-style: normal;
		font-weight: 700;
	}

	.danger-zone {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.danger-text {
		color: var(--star-red);
	}

	.btn-danger {
		background: var(--star-red);
		color: #fff;
		padding: 8px 20px;
		border-radius: var(--radius-sm);
		font-weight: 700;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
</style>
