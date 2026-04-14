<script lang="ts">
	import { goto } from '$app/navigation';
	import { EVENT_TAGS, TAG_COLORS, formatDate, formatTime, shortLocation } from '$lib/utils';

	let { data } = $props();

	let searchInput = $state(data.filters.q);
	let selectedTags = $state<string[]>([...data.filters.tags]);
	let selectedRange = $state(data.filters.range);
	let tagDrawerOpen = $state(false);

	function closeTagDrawer() {
		tagDrawerOpen = false;
	}

	function clearAllTags() {
		selectedTags = [];
		applyFilters();
	}

	// Re-sync from server data when URL changes
	$effect(() => {
		searchInput = data.filters.q;
		selectedTags = [...data.filters.tags];
		selectedRange = data.filters.range;
	});

	const ranges = [
		{ value: 'upcoming', label: 'All Upcoming' },
		{ value: 'today', label: 'Today' },
		{ value: 'week', label: 'This Week' },
		{ value: 'weekend', label: 'This Weekend' },
	];

	function applyFilters() {
		const params = new URLSearchParams();
		if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
		if (selectedRange !== 'upcoming') params.set('range', selectedRange);
		if (searchInput.trim()) params.set('q', searchInput.trim());
		const qs = params.toString();
		goto(qs ? `/?${qs}` : '/', { replaceState: true, invalidateAll: true });
	}

	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
		applyFilters();
	}

	function setRange(range: string) {
		selectedRange = range;
		applyFilters();
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		applyFilters();
	}

	async function trackClick(eventId: number) {
		try {
			await fetch('/api/track-click', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ eventId }),
			});
		} catch {}
	}
</script>

<svelte:head>
	<title>chiirl - Chicago Events</title>
</svelte:head>

<section class="hero">
	<div class="hero-bg">
		<div class="hero-grid"></div>
	</div>
	<div class="container hero-content">
		<div class="hero-badge">
			<svg width="10" height="10" viewBox="0 0 24 24" fill="var(--star-red)">
				<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
			</svg>
			<span>Chicago Events</span>
		</div>
		<h1 class="hero-title">
			<span class="hero-line-1">What's Going On</span>
			<span class="hero-line-2">In Chicago</span>
		</h1>
		<p class="hero-sub">Events, meetups, and gatherings across the city</p>
		<div class="hero-about">
			<p>
				The Chi-IRL team scrapes and aggregates events from Luma, Pie, Meet-Up, Eventbrite,
				LinkedIn and dozens of host organizations to bring you a comprehensive list of quality
				technology-focused events every Monday.
			</p>
			<p>
				We are a service provided by the <a
					href="https://chicagotech.org"
					target="_blank"
					rel="noopener noreferrer">Chicago Technology Collaborative (CTC)</a
				>, an NGO and group of volunteers with a mission to unify and strengthen our city's tech
				ecosystem by fostering meaningful connections between founders, investors, engineers, and
				community builders. Check the home website for our other programs and to become a
				volunteer.
			</p>
		</div>
	</div>
</section>

<section class="filters-section">
	<div class="container">
		<form class="search-bar" onsubmit={handleSearch}>
			<svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
				<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
			</svg>
			<input
				type="text"
				placeholder="Search events..."
				bind:value={searchInput}
				class="search-input"
			/>
			{#if searchInput}
				<button type="button" class="search-clear" onclick={() => { searchInput = ''; applyFilters(); }}>
					&times;
				</button>
			{/if}
		</form>

		<div class="range-tabs">
			{#each ranges as r (r.value)}
				<button
					class="range-tab"
					class:active={selectedRange === r.value}
					onclick={() => setRange(r.value)}
				>
					{r.label}
				</button>
			{/each}
		</div>

		<div class="tag-filters desktop-tags">
			{#each EVENT_TAGS as tag (tag)}
				<button
					class="tag-chip tag-{tag}"
					class:selected={selectedTags.includes(tag)}
					onclick={() => toggleTag(tag)}
					style="--tag-color: {TAG_COLORS[tag]}"
				>
					{tag}
				</button>
			{/each}
		</div>

		<div class="mobile-tag-trigger">
			<button class="tag-trigger-btn" onclick={() => (tagDrawerOpen = true)}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 6h18M6 12h12M10 18h4" />
				</svg>
				<span>Filter by tag</span>
				{#if selectedTags.length > 0}
					<span class="tag-count">{selectedTags.length}</span>
				{/if}
			</button>
			{#if selectedTags.length > 0}
				<div class="active-tags-preview">
					{#each selectedTags as tag (tag)}
						<span class="tag-pill tag-{tag}" style="--tag-color: {TAG_COLORS[tag]}">{tag}</span>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>

{#if tagDrawerOpen}
	<div class="drawer-backdrop" onclick={closeTagDrawer} role="presentation"></div>
	<aside class="tag-drawer" role="dialog" aria-label="Filter by tag">
		<header class="drawer-header">
			<h2 class="drawer-title">Filter by tag</h2>
			<button class="drawer-close" onclick={closeTagDrawer} aria-label="Close">&times;</button>
		</header>
		<div class="drawer-actions">
			<span class="drawer-count">
				{selectedTags.length} selected
			</span>
			{#if selectedTags.length > 0}
				<button class="drawer-clear" onclick={clearAllTags}>Clear all</button>
			{/if}
		</div>
		<div class="drawer-tags">
			{#each EVENT_TAGS as tag (tag)}
				<button
					class="tag-chip tag-{tag}"
					class:selected={selectedTags.includes(tag)}
					onclick={() => toggleTag(tag)}
					style="--tag-color: {TAG_COLORS[tag]}"
				>
					{tag}
				</button>
			{/each}
		</div>
		<div class="drawer-footer">
			<button class="drawer-apply" onclick={closeTagDrawer}>Done</button>
		</div>
	</aside>
{/if}

<section class="events-section">
	<div class="container">
		{#if data.events.length === 0}
			<div class="empty-state">
				<svg class="empty-star" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-light)" stroke-width="1">
					<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
				</svg>
				<p class="empty-title">No events found</p>
				<p class="empty-sub">Try adjusting your filters or check back soon</p>
			</div>
		{:else}
			<div class="results-bar">
				<p class="results-count">{data.events.length} event{data.events.length !== 1 ? 's' : ''}</p>
			</div>
			<div class="events-grid">
				{#each data.events as event, i (event.id)}
					<a
						href="/events/{event.id}"
						class="card event-card animate-in"
						style="animation-delay: {Math.min(i * 40, 400)}ms"
						onclick={() => trackClick(event.id)}
					>
						{#if event.image_url}
							<div class="event-image" style="background-image: url({event.image_url})"></div>
						{:else}
							<div class="event-image event-image-placeholder">
								<span class="event-image-icon">{event.source === 'luma' ? 'L' : event.source === 'meetup' ? 'M' : event.source === 'eventbrite' ? 'E' : event.source === 'pie' ? 'P' : 'U'}</span>
							</div>
						{/if}
						<div class="event-body">
							<div class="event-date">
								<svg width="8" height="8" viewBox="0 0 24 24" fill="var(--star-red)">
									<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
								</svg>
								{formatDate(event.start_time)}
							</div>
							<h3 class="event-title">{event.title}</h3>
							<div class="event-meta">
								<span class="event-time">{formatTime(event.start_time)}</span>
								{#if event.location}
									<span class="event-loc">{shortLocation(event.location)}</span>
								{/if}
							</div>
							<div class="event-tags">
								{#each event.tags as tag (tag)}
									<span class="tag-pill tag-{tag}" style="--tag-color: {TAG_COLORS[tag]}">{tag}</span>
								{/each}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	/* Hero */
	.hero {
		position: relative;
		padding: 72px 0 48px;
		overflow: hidden;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	.hero-grid {
		position: absolute;
		inset: -50%;
		background-image:
			linear-gradient(var(--border) 1px, transparent 1px),
			linear-gradient(90deg, var(--border) 1px, transparent 1px);
		background-size: 60px 60px;
		opacity: 0.3;
		transform: perspective(500px) rotateX(30deg);
		mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
		-webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
	}

	.hero-content {
		position: relative;
		z-index: 1;
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
		animation: fadeInUp 0.5s ease both;
	}

	.hero-title {
		font-size: clamp(2.8rem, 8vw, 5rem);
		line-height: 0.95;
		margin-bottom: 16px;
	}

	.hero-line-1 {
		display: block;
		color: var(--chi-blue);
		animation: fadeInUp 0.5s ease 0.1s both;
	}

	.hero-line-2 {
		display: block;
		color: var(--white);
		animation: fadeInUp 0.5s ease 0.2s both;
	}

	.hero-sub {
		font-size: 1rem;
		color: var(--gray);
		font-weight: 400;
		animation: fadeInUp 0.5s ease 0.3s both;
	}

	.hero-about {
		max-width: 720px;
		margin-top: 28px;
		animation: fadeInUp 0.5s ease 0.4s both;
	}

	.hero-about p {
		font-size: 0.95rem;
		line-height: 1.7;
		color: var(--gray);
		margin-bottom: 14px;
	}

	.hero-about a {
		color: var(--chi-blue);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.hero-about a:hover {
		color: var(--white);
	}

	/* Filters */
	.filters-section {
		padding: 24px 0;
		position: sticky;
		top: 64px;
		z-index: 50;
		background: rgba(10, 10, 10, 0.95);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--border);
	}

	.search-bar {
		position: relative;
		display: flex;
		align-items: center;
		margin-bottom: 14px;
	}

	.search-icon {
		position: absolute;
		left: 14px;
		color: var(--gray-dark);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 11px 40px 11px 40px;
		border: 1.5px solid var(--border-light);
		border-radius: var(--radius-sm);
		font-size: 0.9rem;
		background: var(--black-card);
		color: var(--white);
	}

	.search-input:focus {
		border-color: var(--chi-blue);
	}

	.search-clear {
		position: absolute;
		right: 12px;
		font-size: 1.3rem;
		color: var(--gray);
		line-height: 1;
		padding: 4px;
	}

	.range-tabs {
		display: flex;
		gap: 4px;
		margin-bottom: 12px;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.range-tab {
		padding: 6px 14px;
		border-radius: 2px;
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--gray);
		background: transparent;
		border: 1.5px solid var(--border);
		white-space: nowrap;
		transition: all 0.15s ease;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.range-tab:hover {
		border-color: var(--gray-dark);
		color: var(--white-dim);
	}

	.range-tab.active {
		background: var(--white);
		color: var(--black);
		border-color: var(--white);
	}

	.tag-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.mobile-tag-trigger {
		display: none;
	}

	.tag-trigger-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		border: 1.5px solid var(--border-light);
		border-radius: var(--radius-sm);
		background: var(--black-card);
		color: var(--white-dim);
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.tag-count {
		background: var(--chi-blue);
		color: var(--white);
		font-size: 0.7rem;
		padding: 1px 7px;
		border-radius: 999px;
		font-weight: 800;
	}

	.active-tags-preview {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-top: 8px;
	}

	/* Drawer */
	.drawer-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: 100;
		animation: fadeIn 0.18s ease;
	}

	.tag-drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(88vw, 360px);
		background: var(--black);
		border-left: 1px solid var(--border);
		z-index: 101;
		display: flex;
		flex-direction: column;
		animation: slideInRight 0.22s ease;
	}

	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px 20px;
		border-bottom: 1px solid var(--border);
	}

	.drawer-title {
		font-family: var(--font-display);
		font-size: 1.3rem;
		font-weight: 700;
		color: var(--white);
	}

	.drawer-close {
		font-size: 1.8rem;
		line-height: 1;
		color: var(--gray);
		padding: 0 8px;
		background: transparent;
		border: none;
	}

	.drawer-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 20px;
		border-bottom: 1px solid var(--border);
	}

	.drawer-count {
		font-size: 0.75rem;
		color: var(--gray);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 700;
	}

	.drawer-clear {
		font-size: 0.75rem;
		color: var(--star-red);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 700;
		background: transparent;
		border: none;
	}

	.drawer-tags {
		flex: 1;
		overflow-y: auto;
		padding: 16px 20px;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-content: flex-start;
	}

	.drawer-footer {
		padding: 14px 20px;
		border-top: 1px solid var(--border);
	}

	.drawer-apply {
		width: 100%;
		padding: 12px;
		background: var(--white);
		color: var(--black);
		border: none;
		border-radius: var(--radius-sm);
		font-weight: 700;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideInRight {
		from { transform: translateX(100%); }
		to { transform: translateX(0); }
	}

	.tag-chip {
		padding: 4px 12px;
		border-radius: 2px;
		font-size: 0.72rem;
		font-weight: 700;
		border: 1.5px solid var(--border);
		color: var(--gray);
		background: transparent;
		transition: all 0.15s ease;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.tag-chip:hover {
		border-color: var(--tag-color);
		color: var(--tag-color);
	}

	.tag-chip.selected {
		background: var(--tag-color);
		border-color: var(--tag-color);
		color: #fff;
	}

	/* Events */
	.events-section {
		padding: 32px 0;
	}

	.results-bar {
		margin-bottom: 20px;
	}

	.results-count {
		font-size: 0.75rem;
		color: var(--gray);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.events-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 16px;
	}

	.event-card {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
	}

	.event-image {
		height: 160px;
		background-size: cover;
		background-position: center;
		background-color: var(--black-light);
	}

	.event-image-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--black-light) 0%, var(--black-card) 100%);
	}

	.event-image-icon {
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 900;
		color: var(--border-light);
	}

	.event-body {
		padding: 16px 18px 20px;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.event-date {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--star-red);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 6px;
		font-family: var(--font-mono);
	}

	.event-title {
		font-size: 1.1rem;
		font-weight: 700;
		line-height: 1.25;
		margin-bottom: 8px;
		color: var(--white);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.event-meta {
		display: flex;
		gap: 10px;
		font-size: 0.8rem;
		color: var(--gray);
		margin-bottom: 12px;
		font-family: var(--font-mono);
		font-weight: 400;
	}

	.event-loc::before {
		content: '/';
		margin-right: 4px;
		color: var(--gray-dark);
	}

	.event-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-top: auto;
	}

	.empty-state {
		text-align: center;
		padding: 80px 0;
	}

	.empty-star {
		margin-bottom: 16px;
		opacity: 0.5;
	}

	.empty-title {
		font-size: 1.3rem;
		color: var(--white-dim);
		margin-bottom: 8px;
	}

	.empty-sub {
		color: var(--gray);
		font-size: 0.9rem;
	}

	@media (max-width: 640px) {
		.hero {
			padding: 48px 0 32px;
		}

		.events-grid {
			grid-template-columns: 1fr;
		}

		.desktop-tags {
			display: none;
		}

		.mobile-tag-trigger {
			display: block;
		}
	}
</style>
