<script lang="ts">
	const team = [
		{
			name: 'Hugo Seguin',
			role: 'Project Lead / Developer',
			linkedin: 'https://www.linkedin.com/in/hugoseguin/',
		},
		{
			name: 'Arliss Banks',
			role: 'Head of Platform',
			linkedin: 'https://www.linkedin.com/in/arlissb/',
		},
		{
			name: 'Catherine Witt',
			role: 'Community Liaison',
			linkedin: 'https://www.linkedin.com/in/catherinewitt/',
		},
	];

	const specialThanks = {
		name: 'Michael (Bo) Driscoll',
		linkedin: 'https://www.linkedin.com/in/michaelfdriscoll/',
	};
</script>

<svelte:head>
	<title>Team - chiirl</title>
</svelte:head>

<section class="team-hero">
	<div class="container">
		<div class="team-badge">
			<svg width="10" height="10" viewBox="0 0 24 24" fill="var(--star-red)">
				<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
			</svg>
			<span>Our Team</span>
		</div>
		<h1 class="team-title">The People Behind<br /><span class="accent">chiirl</span></h1>
		<p class="team-sub">Building Chicago's community events platform</p>
	</div>
</section>

<section class="team-section">
	<div class="container">
		<div class="team-grid">
			{#each team as member (member.name)}
				<div class="team-card">
					<div class="card-avatar">
						<span class="avatar-initial">{member.name[0]}</span>
					</div>
					<h2 class="card-name">{member.name}</h2>
					<p class="card-role">{member.role}</p>
					<a href={member.linkedin} target="_blank" rel="noopener noreferrer" class="card-link">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
						</svg>
						<span>LinkedIn</span>
					</a>
				</div>
			{/each}
		</div>

		<div class="special-thanks">
			<p class="thanks-label">Special Thanks</p>
			<div class="thanks-card">
				<div class="card-avatar card-avatar-sm">
					<span class="avatar-initial">{specialThanks.name[0]}</span>
				</div>
				<div class="thanks-info">
					<h3 class="thanks-name">{specialThanks.name}</h3>
					<a href={specialThanks.linkedin} target="_blank" rel="noopener noreferrer" class="card-link">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
							<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
						</svg>
						<span>LinkedIn</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.team-hero {
		padding: 72px 0 48px;
		text-align: center;
	}

	.team-badge {
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

	.team-title {
		font-size: clamp(2.4rem, 6vw, 4rem);
		line-height: 1;
		margin-bottom: 16px;
		color: var(--white);
		animation: fadeInUp 0.5s ease 0.1s both;
	}

	.accent {
		color: var(--chi-blue);
	}

	.team-sub {
		font-size: 1rem;
		color: var(--gray);
		animation: fadeInUp 0.5s ease 0.2s both;
	}

	.team-section {
		padding: 32px 0 80px;
	}

	.team-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 20px;
		margin-bottom: 48px;
	}

	.team-card {
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 32px 24px;
		text-align: center;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
		animation: fadeInUp 0.5s ease both;
	}

	.team-card:nth-child(1) { animation-delay: 0.1s; }
	.team-card:nth-child(2) { animation-delay: 0.15s; }
	.team-card:nth-child(3) { animation-delay: 0.2s; }

	.team-card:hover {
		border-color: var(--border-light);
		box-shadow: var(--shadow-glow);
	}

	.card-avatar {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--chi-blue), var(--star-red));
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 16px;
	}

	.card-avatar-sm {
		width: 48px;
		height: 48px;
		margin: 0;
	}

	.avatar-initial {
		font-family: var(--font-display);
		font-size: 1.6rem;
		font-weight: 800;
		color: #fff;
	}

	.card-avatar-sm .avatar-initial {
		font-size: 1.1rem;
	}

	.card-name {
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--white);
		margin-bottom: 4px;
	}

	.card-role {
		font-size: 0.82rem;
		color: var(--gray);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 16px;
	}

	.card-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--chi-blue);
		transition: color 0.15s ease;
	}

	.card-link:hover {
		color: var(--white);
	}

	.special-thanks {
		text-align: center;
		animation: fadeInUp 0.5s ease 0.3s both;
	}

	.thanks-label {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--star-red);
		margin-bottom: 16px;
	}

	.thanks-card {
		display: inline-flex;
		align-items: center;
		gap: 16px;
		background: var(--black-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 20px 28px;
		transition: border-color 0.2s ease;
	}

	.thanks-card:hover {
		border-color: var(--border-light);
	}

	.thanks-info {
		text-align: left;
	}

	.thanks-name {
		font-size: 1rem;
		font-weight: 700;
		color: var(--white);
		margin-bottom: 4px;
	}

	@media (max-width: 640px) {
		.team-hero {
			padding: 48px 0 32px;
		}

		.team-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
