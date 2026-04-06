<script lang="ts">
	import { enhance } from '$app/forms';
	import { EVENT_TAGS, TAG_COLORS } from '$lib/utils';

	let { form } = $props();

	let title = $state('');
	let description = $state('');
	let startTime = $state('');

	$effect(() => {
		if (form?.title) title = form.title;
		if (form?.description) description = form.description;
		if (form?.start_time) startTime = form.start_time;
	});
	let duplicates = $state<any[]>([]);
	let checking = $state(false);

	async function checkDuplicates() {
		if (!title.trim() || !startTime) return;
		checking = true;
		try {
			const res = await fetch('/api/check-duplicate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: title.trim(), start_time: startTime }),
			});
			if (res.ok) {
				duplicates = await res.json();
			}
		} catch {}
		checking = false;
	}
</script>

<svelte:head>
	<title>Submit Event - chiirl</title>
</svelte:head>

<div class="container submit-page">
	<div class="submit-card animate-in">
		<div class="submit-header">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--star-red)">
				<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
			</svg>
			<h1>Submit an Event</h1>
			<p>Share an event happening in Chicago. It will be reviewed before publishing.</p>
		</div>

		{#if form?.error}
			<div class="error-msg">{form.error}</div>
		{/if}

		{#if duplicates.length > 0}
			<div class="duplicate-warning">
				<strong>Similar events found:</strong>
				<ul>
					{#each duplicates as dup (dup.id)}
						<li>
							<a href="/events/{dup.id}" target="_blank">{dup.title}</a>
							<span class="dup-date">{new Date(dup.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Chicago' })}</span>
						</li>
					{/each}
				</ul>
				<p class="dup-hint">If your event is already listed, no need to submit again!</p>
			</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="form-group">
				<label for="title">Event Title</label>
				<input
					type="text"
					id="title"
					name="title"
					required
					placeholder="e.g. Chicago AI Meetup"
					bind:value={title}
					onblur={checkDuplicates}
				/>
			</div>

			<div class="form-group">
				<label for="description">Description <span class="optional">(optional)</span></label>
				<textarea id="description" name="description" rows="4" placeholder="What's this event about?" bind:value={description}></textarea>
			</div>

			<div class="form-group">
				<label for="url">Event URL</label>
				<input type="url" id="url" name="url" required placeholder="https://..." value={form?.url ?? ''} />
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="start_time">Start Time</label>
					<input
						type="datetime-local"
						id="start_time"
						name="start_time"
						required
						bind:value={startTime}
						onblur={checkDuplicates}
					/>
				</div>
				<div class="form-group">
					<label for="end_time">End Time <span class="optional">(optional)</span></label>
					<input type="datetime-local" id="end_time" name="end_time" value={form?.end_time ?? ''} />
				</div>
			</div>

			<div class="form-group">
				<label for="location">Location <span class="optional">(optional)</span></label>
				<input type="text" id="location" name="location" placeholder="e.g. WeWork, 20 W Kinzie St" value={form?.location ?? ''} />
			</div>

			<div class="form-group">
				<label for="image_url">Image URL <span class="optional">(optional)</span></label>
				<input type="url" id="image_url" name="image_url" placeholder="https://..." value={form?.image_url ?? ''} />
			</div>

			<div class="form-group">
				<span class="field-label">Tags</span>
				<p class="hint">Auto-classified from title/description. Adjust if needed.</p>
				<div class="tag-select">
					{#each EVENT_TAGS as tag (tag)}
						<label class="tag-option tag-{tag}" style="--tag-color: {TAG_COLORS[tag]}">
							<input type="checkbox" name="tags" value={tag} />
							<span class="tag-label">{tag}</span>
						</label>
					{/each}
				</div>
			</div>

			<button type="submit" class="btn btn-primary submit-btn">Submit for Review</button>
		</form>
	</div>
</div>

<style>
	.submit-page {
		display: flex;
		justify-content: center;
		padding: 48px 20px;
	}

	.submit-card {
		width: 100%;
		max-width: 560px;
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 40px;
	}

	.submit-header {
		margin-bottom: 28px;
	}

	.submit-header svg {
		margin-bottom: 12px;
	}

	.submit-header h1 {
		font-size: 1.6rem;
		margin-bottom: 6px;
		color: var(--white);
	}

	.submit-header p {
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

	.duplicate-warning {
		background: rgba(240, 168, 48, 0.08);
		border: 1px solid rgba(240, 168, 48, 0.2);
		padding: 16px 20px;
		border-radius: var(--radius-sm);
		margin-bottom: 20px;
	}

	.duplicate-warning strong {
		display: block;
		margin-bottom: 8px;
		color: #F0A830;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.duplicate-warning ul {
		list-style: none;
		padding: 0;
	}

	.duplicate-warning li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 0;
	}

	.duplicate-warning a {
		color: var(--chi-blue);
		font-weight: 600;
	}

	.dup-date {
		font-size: 0.78rem;
		color: var(--gray);
		font-family: var(--font-mono);
	}

	.dup-hint {
		font-size: 0.8rem;
		color: var(--gray);
		margin-top: 8px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	textarea {
		resize: vertical;
		min-height: 80px;
		font-family: var(--font-display);
		font-size: 1rem;
		padding: 10px 14px;
		border: 1.5px solid var(--border-light);
		border-radius: var(--radius-sm);
		background: var(--black-card);
		color: var(--white);
	}

	textarea:focus {
		outline: none;
		border-color: var(--chi-blue);
		box-shadow: 0 0 0 3px rgba(123, 188, 224, 0.15);
	}

	.field-label {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--white-dim);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.optional {
		color: var(--gray-dark);
		font-weight: 400;
		text-transform: none;
		letter-spacing: 0;
	}

	.tag-select {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 6px;
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

	.submit-btn {
		width: 100%;
		padding: 14px;
		font-size: 0.9rem;
		margin-top: 8px;
	}

	@media (max-width: 480px) {
		.form-row {
			grid-template-columns: 1fr;
		}

		.submit-card {
			padding: 24px;
		}
	}
</style>
