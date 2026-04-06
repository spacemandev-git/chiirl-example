<script lang="ts">
	import { enhance } from '$app/forms';
	import { TAG_COLORS, formatDateTime, shortLocation } from '$lib/utils';

	let { data } = $props();
	let bookmarked = $state(data.bookmarked);

	async function trackAndOpen() {
		try {
			await fetch('/api/track-click', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ eventId: data.event.id }),
			});
		} catch {}
		window.open(data.event.url, '_blank');
	}
</script>

<svelte:head>
	<title>{data.event.title} - chiirl</title>
</svelte:head>

<div class="container detail-page">
	<a href="/" class="back-link">
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
			<path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
		</svg>
		Back to events
	</a>

	<article class="event-detail animate-in">
		{#if data.event.image_url}
			<div class="detail-image" style="background-image: url({data.event.image_url})"></div>
		{/if}

		<div class="detail-header">
			{#if data.event.status === 'pending'}
				<span class="status-badge pending">Pending approval</span>
			{/if}
			<div class="detail-date">
				<svg width="10" height="10" viewBox="0 0 24 24" fill="var(--star-red)">
					<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
				</svg>
				{formatDateTime(data.event.start_time)}
			</div>
			{#if data.event.end_time}
				<div class="detail-end">to {formatDateTime(data.event.end_time)}</div>
			{/if}
			<h1 class="detail-title">{data.event.title}</h1>

			{#if data.event.location}
				<div class="detail-location">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
					</svg>
					{data.event.location}
				</div>
			{/if}

			<div class="detail-tags">
				{#each data.event.tags as tag (tag)}
					<span class="tag-pill tag-{tag}" style="--tag-color: {TAG_COLORS[tag]}">{tag}</span>
				{/each}
				<span class="source-badge">{data.event.source}</span>
			</div>
		</div>

		{#if data.event.description}
			<div class="detail-description">
				<p>{data.event.description}</p>
			</div>
		{/if}

		<div class="detail-actions">
			<button class="btn btn-primary" onclick={trackAndOpen}>
				Open Event
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
					<path d="M7 17 17 7" /><path d="M7 7h10v10" />
				</svg>
			</button>

			{#if data.loggedIn}
				{#if bookmarked}
					<form method="POST" action="?/unbookmark" use:enhance={() => { return async ({ update }) => { bookmarked = false; update(); }; }}>
						<button class="btn btn-secondary bookmarked-btn">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--star-red)" stroke="var(--star-red)" stroke-width="2">
								<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
							</svg>
							Bookmarked
						</button>
					</form>
				{:else}
					<form method="POST" action="?/bookmark" use:enhance={() => { return async ({ update }) => { bookmarked = true; update(); }; }}>
						<button class="btn btn-secondary">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
							</svg>
							Bookmark
						</button>
					</form>
				{/if}
			{/if}
		</div>
	</article>
</div>

<style>
	.detail-page {
		padding: 40px 20px;
		max-width: 720px;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--gray);
		margin-bottom: 24px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.back-link:hover {
		color: var(--white);
	}

	.event-detail {
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.detail-image {
		height: 280px;
		background-size: cover;
		background-position: center;
		background-color: var(--black-light);
	}

	.detail-header {
		padding: 28px 32px 0;
	}

	.status-badge {
		display: inline-block;
		font-size: 0.7rem;
		font-weight: 700;
		padding: 4px 12px;
		border-radius: 2px;
		margin-bottom: 12px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.status-badge.pending {
		background: rgba(230, 57, 70, 0.15);
		color: var(--star-red);
	}

	.detail-date {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--star-red);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-family: var(--font-mono);
	}

	.detail-end {
		font-size: 0.78rem;
		color: var(--gray);
		margin-top: 4px;
		font-family: var(--font-mono);
	}

	.detail-title {
		font-size: clamp(1.5rem, 4vw, 2rem);
		margin-top: 14px;
		color: var(--white);
	}

	.detail-location {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 14px;
		font-size: 0.9rem;
		color: var(--gray);
	}

	.detail-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 18px;
	}

	.source-badge {
		display: inline-flex;
		padding: 3px 10px;
		border-radius: 2px;
		font-size: 0.7rem;
		font-weight: 700;
		background: var(--black-hover);
		color: var(--gray);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.detail-description {
		padding: 24px 32px;
		font-size: 0.95rem;
		line-height: 1.7;
		color: var(--white-dim);
		border-top: 1px solid var(--border);
		margin-top: 24px;
	}

	.detail-actions {
		display: flex;
		gap: 12px;
		padding: 24px 32px 32px;
	}

	.bookmarked-btn {
		border-color: var(--star-red) !important;
		color: var(--star-red) !important;
	}

	@media (max-width: 640px) {
		.detail-header,
		.detail-description,
		.detail-actions {
			padding-left: 20px;
			padding-right: 20px;
		}

		.detail-image {
			height: 200px;
		}
	}
</style>
