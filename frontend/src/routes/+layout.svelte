<script lang="ts">
	import '../app.css';

	let { children, data } = $props();
</script>

<div class="app">
	<header class="site-header">
		<div class="container header-inner">
			<a href="/" class="logo">
				<img src="/logo.png" alt="chiirl" class="logo-img" />
			</a>
			<nav class="nav">
				<a href="/" class="nav-link">Events</a>
				<a href="/team" class="nav-link">Team</a>
				<a href="/submit" class="nav-link">Submit</a>
				{#if data.user}
					<a href="/settings" class="nav-link">Settings</a>
					{#if data.isAdmin}
						<a href="/admin" class="nav-link nav-admin">Admin</a>
					{/if}
					<form method="POST" action="/settings?/logout" class="nav-logout-form">
						<button type="submit" class="nav-link nav-logout">Log Out</button>
					</form>
				{:else}
					<a href="/login" class="nav-link nav-cta">Sign In</a>
				{/if}
			</nav>
		</div>
	</header>

	<main>
		{@render children()}
	</main>

	<footer class="site-footer">
		<div class="container footer-inner">
			<div class="footer-brand">
				<div class="footer-logo">
					<span class="footer-chi">CHI</span>
					<svg class="footer-star" width="12" height="12" viewBox="0 0 24 24" fill="var(--star-red)">
						<polygon points="12,0 14.5,8.5 24,9.5 16.5,15 19,24 12,18.5 5,24 7.5,15 0,9.5 9.5,8.5" />
					</svg>
					<span class="footer-irl">IRL</span>
				</div>
				<p>Discover what's happening in Chicago</p>
			</div>
			<div class="footer-links">
				{#if data.user}
					<a href="/settings">Settings</a>
				{:else}
					<a href="/login">Sign In</a>
				{/if}
				<a href="/submit">Submit Event</a>
				<a href="/team">Team</a>
			</div>
		</div>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
	}

	.site-header {
		position: sticky;
		top: 0;
		z-index: 100;
		border-bottom: 1px solid var(--border);
		backdrop-filter: blur(16px);
		background: rgba(10, 10, 10, 0.9);
	}

	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
	}

	.logo {
		display: flex;
		align-items: center;
	}

	.logo-img {
		height: 36px;
		width: auto;
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.nav-link {
		padding: 6px 14px;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--gray);
		border-radius: var(--radius-sm);
		transition: all 0.15s ease;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.nav-link:hover {
		background: var(--black-hover);
		color: var(--white);
	}

	.nav-cta {
		background: var(--star-red);
		color: #fff !important;
	}

	.nav-cta:hover {
		background: var(--star-red-dark) !important;
		color: #fff !important;
	}

	.nav-admin {
		color: var(--chi-blue);
	}

	.nav-logout-form {
		display: contents;
	}

	.nav-logout {
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
	}

	.site-footer {
		margin-top: 80px;
		padding: 40px 0;
		border-top: 1px solid var(--border);
	}

	.footer-inner {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.footer-logo {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 8px;
	}

	.footer-chi {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 1rem;
		color: var(--chi-blue);
		letter-spacing: 0.02em;
	}

	.footer-star {
		flex-shrink: 0;
	}

	.footer-irl {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 1rem;
		color: var(--white);
		letter-spacing: 0.02em;
	}

	.footer-brand p {
		font-size: 0.82rem;
		color: var(--gray);
	}

	.footer-links {
		display: flex;
		gap: 20px;
	}

	.footer-links a {
		font-size: 0.82rem;
		color: var(--gray);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 600;
	}

	.footer-links a:hover {
		color: var(--white);
	}

	@media (max-width: 480px) {
		.nav-link:not(.nav-cta):not(.nav-admin) {
			display: none;
		}

		.footer-inner {
			flex-direction: column;
			gap: 20px;
		}
	}
</style>
