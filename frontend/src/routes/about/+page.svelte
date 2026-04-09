<script lang="ts">
	type Member = {
		name: string;
		role?: string;
		linkedin?: string;
	};

	type Era = {
		year: string;
		members: Member[];
		description: string;
	};

	const eras: Era[] = [
		{
			year: '2023–2024',
			members: [
				{ name: 'Abhinaya' },
				{ name: 'Arliss Banks', linkedin: 'https://www.linkedin.com/in/arlissb/' },
			],
			description:
				'OGs create a text event distribution and newsletter. They join forces and Chi-IRL is born!',
		},
		{
			year: '2025',
			members: [
				{
					name: 'Hugo Seguin',
					role: 'Engineering Director',
					linkedin: 'https://www.linkedin.com/in/hugoseguin/',
				},
				{
					name: 'Catherine Witt',
					role: 'Product & UX/UI Lead',
					linkedin: 'https://www.linkedin.com/in/catherinewitt/',
				},
			],
			description:
				'Chi-IRL joins the CTC; Catherine designs a recipient survey and data analytics.',
		},
		{
			year: '2026',
			members: [
				{ name: 'Everett', role: 'Front-End Developer' },
				{ name: 'Christian', role: 'Automation Maverick' },
				{ name: 'Robert', role: 'Open Source Guru' },
			],
			description: 'Database, linkage to CTC, and more — Chicago Emerging Tech Community.',
		},
	];

	const specialThanks: Member[] = [
		{
			name: 'Michael (Bo) Driscoll',
			linkedin: 'https://www.linkedin.com/in/michaelfdriscoll/',
		},
		{ name: 'Kevin' },
		{ name: 'Nitin Murali' },
		{ name: 'Alex Nova' },
	];
</script>

<svelte:head>
	<title>About - chiirl</title>
</svelte:head>

<section class="about-hero">
	<div class="container">
		<div class="about-badge">
			<svg width="10" height="10" viewBox="0 0 24 24" fill="var(--star-red)">
				<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
			</svg>
			<span>About Us</span>
		</div>
		<h1 class="about-title">By Volunteers,<br /><span class="accent">For Chicago</span></h1>
		<p class="about-sub">The story and the people behind chiirl</p>
	</div>
</section>

<section class="about-section">
	<div class="container narrow">
		<p class="about-text">
			The Chi-IRL team scrapes and aggregates events from Luma, Pie, Meet-Up, Eventbrite,
			LinkedIn and dozens of host organizations to bring you a comprehensive list of quality
			technology-focused events every Monday.
		</p>
		<p class="about-text">
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
</section>

<section class="history-section">
	<div class="container">
		<h2 class="history-title">Our History</h2>
		<div class="timeline">
			{#each eras as era (era.year)}
				<div class="era">
					<div class="era-year">{era.year}</div>
					<div class="era-content">
						<div class="era-members">
							{#each era.members as member (member.name)}
								<div class="member-card">
									<div class="card-avatar">
										<span class="avatar-initial">{member.name[0]}</span>
									</div>
									<h3 class="card-name">{member.name}</h3>
									{#if member.role}
										<p class="card-role">{member.role}</p>
									{/if}
									{#if member.linkedin}
										<a
											href={member.linkedin}
											target="_blank"
											rel="noopener noreferrer"
											class="card-link"
										>
											<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
												<path
													d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
												/>
											</svg>
											<span>LinkedIn</span>
										</a>
									{/if}
								</div>
							{/each}
						</div>
						<p class="era-description">{era.description}</p>
					</div>
				</div>
			{/each}
		</div>

		<div class="special-thanks">
			<p class="thanks-label">Special Thanks</p>
			<div class="thanks-grid">
				{#each specialThanks as person (person.name)}
					<div class="thanks-card">
						<div class="card-avatar card-avatar-sm">
							<span class="avatar-initial">{person.name[0]}</span>
						</div>
						<div class="thanks-info">
							<h3 class="thanks-name">{person.name}</h3>
							{#if person.linkedin}
								<a
									href={person.linkedin}
									target="_blank"
									rel="noopener noreferrer"
									class="card-link"
								>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
										<path
											d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
										/>
									</svg>
									<span>LinkedIn</span>
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.about-hero {
		padding: 72px 0 32px;
		text-align: center;
	}

	.about-badge {
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

	.about-title {
		font-size: clamp(2.4rem, 6vw, 4rem);
		line-height: 1;
		margin-bottom: 16px;
		color: var(--white);
	}

	.accent {
		color: var(--chi-blue);
	}

	.about-sub {
		font-size: 1rem;
		color: var(--gray);
	}

	.about-section {
		padding: 32px 0 24px;
	}

	.narrow {
		max-width: 720px;
	}

	.about-text {
		font-size: 1.05rem;
		line-height: 1.7;
		color: var(--gray);
		margin-bottom: 20px;
	}

	.about-text a {
		color: var(--chi-blue);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.about-text a:hover {
		color: var(--white);
	}

	.history-section {
		padding: 32px 0 80px;
	}

	.history-title {
		font-size: clamp(1.8rem, 4vw, 2.4rem);
		text-align: center;
		color: var(--white);
		margin-bottom: 48px;
	}

	.timeline {
		display: flex;
		flex-direction: column;
		gap: 56px;
		margin-bottom: 64px;
		position: relative;
	}

	.era {
		display: grid;
		grid-template-columns: 140px 1fr;
		gap: 24px;
		align-items: start;
	}

	.era-year {
		font-family: var(--font-display);
		font-size: 1.4rem;
		font-weight: 800;
		color: var(--chi-blue);
		text-align: right;
		padding-top: 24px;
		border-right: 2px solid var(--border);
		padding-right: 20px;
	}

	.era-content {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.era-members {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}

	.member-card {
		flex: 1 1 200px;
		max-width: 260px;
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 24px 20px;
		text-align: center;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.member-card:hover {
		border-color: var(--border-light);
		box-shadow: var(--shadow-glow);
	}

	.card-avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--chi-blue), var(--star-red));
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 12px;
	}

	.card-avatar-sm {
		width: 44px;
		height: 44px;
		margin: 0;
	}

	.avatar-initial {
		font-family: var(--font-display);
		font-size: 1.4rem;
		font-weight: 800;
		color: #fff;
	}

	.card-avatar-sm .avatar-initial {
		font-size: 1rem;
	}

	.card-name {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--white);
		margin-bottom: 4px;
	}

	.card-role {
		font-size: 0.75rem;
		color: var(--gray);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 12px;
	}

	.card-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--chi-blue);
		transition: color 0.15s ease;
	}

	.card-link:hover {
		color: var(--white);
	}

	.era-description {
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--gray);
		font-style: italic;
		padding-left: 4px;
	}

	.special-thanks {
		text-align: center;
	}

	.thanks-label {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--star-red);
		margin-bottom: 20px;
	}

	.thanks-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		justify-content: center;
	}

	.thanks-card {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 14px 20px;
		transition: border-color 0.2s ease;
	}

	.thanks-card:hover {
		border-color: var(--border-light);
	}

	.thanks-info {
		text-align: left;
	}

	.thanks-name {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--white);
		margin-bottom: 2px;
	}

	@media (max-width: 720px) {
		.about-hero {
			padding: 48px 0 24px;
		}

		.era {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.era-year {
			text-align: left;
			border-right: none;
			border-left: 3px solid var(--chi-blue);
			padding-right: 0;
			padding-left: 12px;
			padding-top: 0;
		}

		.member-card {
			max-width: 100%;
		}
	}
</style>
