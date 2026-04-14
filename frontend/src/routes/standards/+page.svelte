<script lang="ts">
	const industries = [
		'agetech',
		'AI',
		'AR/VR/XR',
		'biotech',
		'cannabis',
		'cleantech',
		'climate tech',
		'consumer',
		'crypto/Web3',
		'cybersecurity',
		'data',
		'edtech',
		'entertainment',
		'fintech',
		'foodtech',
		'future of work',
		'hardtech',
		'health',
		'insurtech',
		'legal tech',
		'quantum',
		'saas',
		'sports',
		'supply chain',
	];

	const formats = [
		'co-working',
		'discussion',
		'hangout',
		'networking',
		'pitching or demo',
		'speaker panel or fireside',
	];

	const topics = [
		'branding',
		'business strategy',
		'capital deployment',
		'code engineering',
		'finance',
		'fundraising',
		'GTM',
		'legal/IP',
		'marketing',
		'organization management',
		'recruiting',
		'product',
		'pitching or demo (how to)',
		'policy',
		'sales',
		'scaling',
		'UI/UX/CX',
	];

	const criteria = [
		'At least one of the event organizers must be in attendance.',
		'_______________',
		'_______________',
	];
</script>

<svelte:head>
	<title>Standards & Organization - chiirl</title>
</svelte:head>

<section class="page-hero">
	<div class="container">
		<div class="hero-badge">
			<svg width="10" height="10" viewBox="0 0 24 24" fill="var(--star-red)">
				<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
			</svg>
			<span>How We Work</span>
		</div>
		<h1 class="page-title">Standards &amp; <span class="accent">Organization</span></h1>
		<p class="page-sub">How we curate events for Chicago's tech community</p>
	</div>
</section>

<section class="content-section">
	<div class="container narrow">
		<article class="block">
			<h2 class="block-title">Our Audience</h2>
			<p class="block-text">
				The audience we seek to serve is founders, investors, engineers, builders, operators,
				service-providers and enthusiasts. As our event list grows, we will be implementing a
				preferences filter to ensure everyone is receiving events most relevant to them.
			</p>
		</article>

		<article class="block">
			<h2 class="block-title">Industries, Organizations, and Partners</h2>
			<p class="block-text">
				We track over 300 Chicago tech organizations, investor groups, communities,
				identity-focused groups, hackerspaces, incubators, accelerators, tech-focused
				non-profits, and university programs across key event forums and organization pages.
			</p>

			<h3 class="sub-title">Industries we follow</h3>
			<div class="tag-grid">
				{#each industries as industry (industry)}
					<span class="tag">{industry}</span>
				{/each}
			</div>

			<h3 class="sub-title">Tagging by format</h3>
			<div class="tag-grid">
				{#each formats as format (format)}
					<span class="tag tag-format">{format}</span>
				{/each}
			</div>

			<h3 class="sub-title">Tagging by topic</h3>
			<div class="tag-grid">
				{#each topics as topic (topic)}
					<span class="tag tag-topic">{topic}</span>
				{/each}
			</div>


			<p class="block-text">
				We follow and partner with several voices in the tech community to keep abreast of
				developing trends. Through collaboration, we seek to reduce the noise that slows down
				newcomers to the ecosystem and improve the sense of community by centralizing
				information.
			</p>
		</article>

		<article class="block">
			<h2 class="block-title">Our Standards</h2>
			<p class="block-text">
				Our engineers use code to scrape dozens of websites for keywords, industry terms, and
				organization names. We categorize these events by audience, topic, format, and start-up
				phase, and curate to share only quality events with you. Our mission is to help you
				avoid low-return uses of your time.
			</p>

			<div class="criteria-card">
				<h3 class="criteria-title">To stay on the listing, an event must meet the following criteria:</h3>
				<ul class="criteria-list">
					{#each criteria as item, i (i)}
						<li>{item}</li>
					{/each}
				</ul>
			</div>
		</article>
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
		max-width: 760px;
	}

	.block {
		margin-bottom: 56px;
	}

	.block-title {
		font-size: clamp(1.5rem, 3.5vw, 2rem);
		color: var(--white);
		margin-bottom: 20px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--border);
	}

	.sub-title {
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--star-red);
		margin: 28px 0 14px;
	}

	.block-text {
		font-size: 1.02rem;
		line-height: 1.7;
		color: var(--gray);
		margin-bottom: 16px;
	}

	.note {
		font-style: italic;
		font-size: 0.92rem;
		margin-top: 16px;
	}

	.tag-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 8px;
	}

	.tag {
		display: inline-block;
		padding: 6px 12px;
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: 999px;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--white);
		transition: border-color 0.15s ease;
	}

	.tag:hover {
		border-color: var(--chi-blue);
	}

	.tag-format {
		border-color: rgba(0, 119, 182, 0.4);
	}

	.tag-topic {
		border-color: rgba(229, 62, 62, 0.4);
	}

	.criteria-card {
		margin-top: 24px;
		padding: 24px 28px;
		background: var(--black-card);
		border: 1px solid var(--border);
		border-left: 3px solid var(--chi-blue);
		border-radius: var(--radius-md);
	}

	.criteria-title {
		font-size: 0.98rem;
		font-weight: 700;
		color: var(--white);
		margin-bottom: 14px;
	}

	.criteria-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.criteria-list li {
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--gray);
		padding: 8px 0 8px 22px;
		position: relative;
	}

	.criteria-list li::before {
		content: '✓';
		position: absolute;
		left: 0;
		color: var(--chi-blue);
		font-weight: 700;
	}

	@media (max-width: 640px) {
		.page-hero {
			padding: 48px 0 24px;
		}

		.criteria-card {
			padding: 20px;
		}
	}
</style>
