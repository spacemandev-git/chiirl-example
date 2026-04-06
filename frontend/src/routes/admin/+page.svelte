<script lang="ts">
	import { enhance } from '$app/forms';
	import { TAG_COLORS, formatDate } from '$lib/utils';

	let { data, form } = $props();

	let activeTab = $state<'stats' | 'pending'>('stats');

	// Compute max for the bar chart
	let maxDailyClicks = $derived(
		data.stats?.dailyClicks.length
			? Math.max(...data.stats.dailyClicks.map((d: any) => d.clicks), 1)
			: 1
	);

	function timeAgo(iso: string): string {
		const diff = Date.now() - new Date(iso).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		const days = Math.floor(hrs / 24);
		return `${days}d ago`;
	}
</script>

<svelte:head>
	<title>Admin - chiirl</title>
</svelte:head>

<div class="container admin-page">
	{#if !data.authenticated}
		<div class="denied-card animate-in">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="var(--star-red)">
				<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
			</svg>
			<h1>Admin Access Required</h1>
			<p>You need to be signed in with an admin email to access this page.</p>
			<a href="/login" class="btn btn-primary" style="margin-top: 16px;">Sign In</a>
		</div>
	{:else}
		<div class="admin-header">
			<h1>Dashboard</h1>
			<div class="tab-bar">
				<button class="tab" class:active={activeTab === 'stats'} onclick={() => activeTab = 'stats'}>
					Statistics
				</button>
				<button class="tab" class:active={activeTab === 'pending'} onclick={() => activeTab = 'pending'}>
					Pending
					{#if data.events.length > 0}
						<span class="tab-badge">{data.events.length}</span>
					{/if}
				</button>
			</div>
		</div>

		{#if activeTab === 'stats' && data.stats}
			<!-- Overview Cards -->
			<div class="stat-grid animate-in">
				<div class="stat-card">
					<div class="stat-label">Total Clicks</div>
					<div class="stat-value">{data.stats.clicks.total.toLocaleString()}</div>
					<div class="stat-sub">
						<span class="stat-detail">{data.stats.clicks.last7d} last 7d</span>
						<span class="stat-sep">/</span>
						<span class="stat-detail">{data.stats.clicks.last30d} last 30d</span>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-label">Unique Clickers</div>
					<div class="stat-value">{data.stats.clicks.uniqueUsers.toLocaleString()}</div>
					<div class="stat-sub">logged-in users who clicked</div>
				</div>
				<div class="stat-card">
					<div class="stat-label">Users</div>
					<div class="stat-value">{data.stats.users.total.toLocaleString()}</div>
					<div class="stat-sub">
						<span class="stat-detail">+{data.stats.users.last7d} last 7d</span>
						<span class="stat-sep">/</span>
						<span class="stat-detail">+{data.stats.users.last30d} last 30d</span>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-label">Events</div>
					<div class="stat-value">{data.stats.events.total.toLocaleString()}</div>
					<div class="stat-sub">
						<span class="stat-approved">{data.stats.events.approved} approved</span>
						<span class="stat-sep">/</span>
						<span class="stat-pending">{data.stats.events.pending} pending</span>
					</div>
				</div>
			</div>

			<!-- Click Sources -->
			{#if data.stats.clickSources.length > 0}
				<div class="section animate-in" style="animation-delay: 0.1s">
					<h2 class="section-title">Click Sources <span class="section-period">Last 30 days</span></h2>
					<div class="source-pills">
						{#each data.stats.clickSources as src (src.source)}
							<div class="source-pill">
								<span class="source-name">{src.source}</span>
								<span class="source-count">{src.count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Daily Clicks Chart -->
			{#if data.stats.dailyClicks.length > 0}
				<div class="section animate-in" style="animation-delay: 0.15s">
					<h2 class="section-title">Daily Clicks <span class="section-period">Last 14 days</span></h2>
					<div class="chart">
						{#each data.stats.dailyClicks as day (day.day)}
							<div class="chart-col">
								<div class="chart-tooltip">{day.clicks} clicks / {day.uniqueUsers} users</div>
								<div class="chart-bar-wrap">
									<div
										class="chart-bar"
										style="height: {(day.clicks / maxDailyClicks) * 100}%"
									></div>
								</div>
								<div class="chart-label">{day.day.slice(5)}</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Top Events -->
			{#if data.stats.topEvents.length > 0}
				<div class="section animate-in" style="animation-delay: 0.2s">
					<h2 class="section-title">Top Events <span class="section-period">Last 30 days</span></h2>
					<div class="table-wrap">
						<table class="data-table">
							<thead>
								<tr>
									<th>Event</th>
									<th>Date</th>
									<th class="num">Clicks</th>
									<th class="num">Unique</th>
								</tr>
							</thead>
							<tbody>
								{#each data.stats.topEvents as event (event.id)}
									<tr>
										<td>
											<a href="/events/{event.id}" class="event-link">{event.title}</a>
											<div class="event-link-tags">
												{#each event.tags as tag (tag)}
													<span class="tag-pill tag-{tag}" style="--tag-color: {TAG_COLORS[tag]}">{tag}</span>
												{/each}
											</div>
										</td>
										<td class="mono">{formatDate(event.startTime)}</td>
										<td class="num mono">{event.clickCount}</td>
										<td class="num mono">{event.uniqueClickers}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<!-- Top Users -->
			{#if data.stats.topUsers.length > 0}
				<div class="section animate-in" style="animation-delay: 0.25s">
					<h2 class="section-title">Most Active Users <span class="section-period">Last 30 days</span></h2>
					<div class="table-wrap">
						<table class="data-table">
							<thead>
								<tr>
									<th>User</th>
									<th class="num">Clicks</th>
									<th class="num">Events</th>
									<th>Last Active</th>
								</tr>
							</thead>
							<tbody>
								{#each data.stats.topUsers as user (user.id)}
									<tr>
										<td>
											<span class="user-name">{user.name || 'Anonymous'}</span>
											<span class="user-email">{user.email}</span>
										</td>
										<td class="num mono">{user.clickCount}</td>
										<td class="num mono">{user.eventsClicked}</td>
										<td class="mono">{timeAgo(user.lastClick)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

		{:else if activeTab === 'pending'}
			{#if data.events.length === 0}
				<div class="empty-state animate-in">
					<p class="empty-title">No pending events</p>
					<p class="empty-sub">All clear! Check back later.</p>
				</div>
			{:else}
				<div class="pending-list">
					{#each data.events as event (event.id)}
						<div class="pending-card animate-in">
							<div class="pending-info">
								<h3>{event.title}</h3>
								<div class="pending-meta">
									<span>{new Date(event.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' })}</span>
									{#if event.location}
										<span>/ {event.location}</span>
									{/if}
								</div>
								{#if event.description}
									<p class="pending-desc">{event.description.slice(0, 200)}{event.description.length > 200 ? '...' : ''}</p>
								{/if}
								<div class="pending-tags">
									{#each event.tags as tag (tag)}
										<span class="tag-pill tag-{tag}" style="--tag-color: {TAG_COLORS[tag]}">{tag}</span>
									{/each}
								</div>
								<div class="pending-submitter">
									Submitted by {event.submitted_by_name || event.submitted_by_email || 'Unknown'}
									/ <a href={event.url} target="_blank" rel="noopener">View Link</a>
								</div>
							</div>
							<div class="pending-actions">
								<form method="POST" action="?/approve" use:enhance>
									<input type="hidden" name="event_id" value={event.id} />
									<button type="submit" class="btn btn-approve">Approve</button>
								</form>
								<form method="POST" action="?/reject" use:enhance>
									<input type="hidden" name="event_id" value={event.id} />
									<button type="submit" class="btn btn-reject">Reject</button>
								</form>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	{/if}
</div>

<style>
	.admin-page {
		padding: 48px 20px;
		max-width: 960px;
	}

	/* Denied */
	.denied-card {
		max-width: 400px;
		margin: 0 auto;
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 40px;
		text-align: center;
	}

	.denied-card svg { margin-bottom: 16px; }
	.denied-card h1 { font-size: 1.3rem; margin-bottom: 8px; color: var(--white); }
	.denied-card p { color: var(--gray); font-size: 0.9rem; }

	/* Header + Tabs */
	.admin-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 32px;
	}

	.admin-header h1 {
		font-size: 1.6rem;
		color: var(--white);
	}

	.tab-bar {
		display: flex;
		gap: 2px;
		background: var(--black-light);
		border-radius: var(--radius-sm);
		padding: 3px;
	}

	.tab {
		padding: 6px 16px;
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--gray);
		border-radius: 2px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.tab:hover { color: var(--white-dim); }

	.tab.active {
		background: var(--black-card);
		color: var(--white);
	}

	.tab-badge {
		background: var(--star-red);
		color: #fff;
		font-size: 0.65rem;
		padding: 1px 6px;
		border-radius: 2px;
		font-weight: 700;
	}

	/* Stat Cards */
	.stat-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		margin-bottom: 32px;
	}

	.stat-card {
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 20px;
	}

	.stat-label {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--gray);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 8px;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 900;
		color: var(--white);
		line-height: 1;
		margin-bottom: 8px;
		letter-spacing: -0.02em;
	}

	.stat-sub {
		font-size: 0.72rem;
		color: var(--gray-dark);
		font-family: var(--font-mono);
	}

	.stat-detail { color: var(--gray); }
	.stat-sep { color: var(--border-light); margin: 0 2px; }
	.stat-approved { color: #2ECC71; }
	.stat-pending { color: #F0A830; }

	/* Sections */
	.section {
		margin-bottom: 32px;
	}

	.section-title {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--chi-blue);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 16px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.section-period {
		font-size: 0.7rem;
		color: var(--gray-dark);
		font-weight: 600;
		font-family: var(--font-mono);
	}

	/* Source pills */
	.source-pills {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.source-pill {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
	}

	.source-name {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--white-dim);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.source-count {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--chi-blue);
		font-family: var(--font-mono);
	}

	/* Bar Chart */
	.chart {
		display: flex;
		align-items: flex-end;
		gap: 6px;
		height: 180px;
		padding: 16px 0;
		border-bottom: 1px solid var(--border);
	}

	.chart-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		position: relative;
	}

	.chart-tooltip {
		position: absolute;
		top: -8px;
		font-size: 0.65rem;
		font-family: var(--font-mono);
		color: var(--gray);
		white-space: nowrap;
		opacity: 0;
		transition: opacity 0.15s ease;
		pointer-events: none;
	}

	.chart-col:hover .chart-tooltip {
		opacity: 1;
	}

	.chart-bar-wrap {
		flex: 1;
		width: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.chart-bar {
		width: 100%;
		max-width: 32px;
		background: var(--chi-blue);
		border-radius: 2px 2px 0 0;
		min-height: 2px;
		transition: height 0.3s ease, background 0.15s ease;
	}

	.chart-col:hover .chart-bar {
		background: var(--white);
	}

	.chart-label {
		font-size: 0.65rem;
		color: var(--gray-dark);
		font-family: var(--font-mono);
		margin-top: 8px;
	}

	/* Tables */
	.table-wrap {
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
	}

	.data-table th {
		font-size: 0.68rem;
		font-weight: 700;
		color: var(--gray);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		padding: 8px 12px;
		text-align: left;
		border-bottom: 1px solid var(--border);
	}

	.data-table td {
		padding: 12px 12px;
		font-size: 0.85rem;
		color: var(--white-dim);
		border-bottom: 1px solid var(--border);
		vertical-align: top;
	}

	.data-table tr:hover td {
		background: var(--black-light);
	}

	.data-table .num {
		text-align: right;
	}

	.data-table .mono {
		font-family: var(--font-mono);
		font-size: 0.8rem;
	}

	.event-link {
		color: var(--white);
		font-weight: 600;
	}

	.event-link:hover {
		color: var(--chi-blue);
	}

	.event-link-tags {
		display: flex;
		gap: 3px;
		margin-top: 4px;
	}

	.user-name {
		display: block;
		font-weight: 600;
		color: var(--white);
	}

	.user-email {
		font-size: 0.75rem;
		color: var(--gray-dark);
		font-family: var(--font-mono);
	}

	/* Pending (same as before) */
	.empty-state {
		text-align: center;
		padding: 60px 0;
	}

	.empty-title {
		font-size: 1.2rem;
		margin-bottom: 6px;
		color: var(--white-dim);
	}

	.empty-sub {
		color: var(--gray);
	}

	.pending-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.pending-card {
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 24px;
		display: flex;
		justify-content: space-between;
		gap: 20px;
	}

	.pending-info { flex: 1; }
	.pending-info h3 { font-size: 1.05rem; margin-bottom: 6px; color: var(--white); }

	.pending-meta {
		font-size: 0.8rem;
		color: var(--gray);
		margin-bottom: 8px;
		font-family: var(--font-mono);
	}

	.pending-desc {
		font-size: 0.88rem;
		color: var(--white-dim);
		margin-bottom: 10px;
		line-height: 1.5;
	}

	.pending-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-bottom: 8px;
	}

	.pending-submitter {
		font-size: 0.75rem;
		color: var(--gray-dark);
		font-family: var(--font-mono);
	}

	.pending-submitter a { color: var(--chi-blue); }

	.pending-actions {
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex-shrink: 0;
	}

	.btn-approve {
		background: #16A34A;
		color: #fff;
		padding: 8px 20px;
		border-radius: var(--radius-sm);
		font-weight: 700;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.btn-approve:hover { background: #15803D; }

	.btn-reject {
		background: transparent;
		color: var(--star-red);
		padding: 8px 20px;
		border-radius: var(--radius-sm);
		font-weight: 700;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		border: 1.5px solid rgba(230, 57, 70, 0.3);
	}

	.btn-reject:hover { background: rgba(230, 57, 70, 0.1); }

	/* Responsive */
	@media (max-width: 768px) {
		.stat-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.admin-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 16px;
		}
	}

	@media (max-width: 640px) {
		.stat-grid {
			grid-template-columns: 1fr;
		}

		.pending-card {
			flex-direction: column;
		}

		.pending-actions {
			flex-direction: row;
		}

		.chart {
			height: 120px;
		}
	}
</style>
