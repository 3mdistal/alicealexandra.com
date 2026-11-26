<svelte:head>
	<title>Privacy | Alice Alexandra</title>
	<meta
		name="description"
		content="How Sarah Game Videos, a private tool Alice Alexandra Moore uses with her own YouTube channel, handles data."
	/>
</svelte:head>

<main class="career-detail-surface">
	<div class="hero">
		<div class="hero-content">
			<h1 class="accent-color">privacy</h1>
			<p class="hero-subtitle">Last updated October 23, 2026.</p>
		</div>
	</div>

	<div class="content">
		<section class="policy">
			<h2 class="policy-title">Sarah Game Videos</h2>
			<p>
				Sarah Game Videos is a small tool I made for myself. When I finish recording a game session,
				it uploads the recording to my own YouTube channel as a private video, so I can share it
				with a friend.
			</p>
			<ul>
				<li>Only I use it, on my own computer. It isn't offered to anyone else.</li>
				<li>
					It asks Google for two permissions: to upload videos to my channel, and to see my
					channel's videos. It uses them only to upload my recordings and check that they arrived.
				</li>
				<li>
					Its Google sign-in stays on my computer. It doesn't collect, sell or share anything, and
					it sends nothing anywhere but YouTube.
				</li>
				<li>
					To remove its access, go to
					<a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>.
				</li>
			</ul>
			<p>
				Questions? Reach out on any of the socials on my <a href="/about#connect">about page</a>.
			</p>
		</section>
	</div>
</main>

<style>
	.policy {
		margin: 0 auto;
		box-shadow: var(--shadow-2);
		border-radius: var(--radius-12);
		background-color: var(--color-surface);
		padding: var(--space-40);
		max-width: 800px;
		color: var(--color-text);
		font-size: var(--font-size-20);
		line-height: var(--line-height-body);
	}

	.policy-title {
		margin-bottom: var(--space-16);
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-32);
		font-family: var(--font-serif);
	}

	.policy ul {
		margin: var(--space-24) 0;
		padding-left: var(--space-24);
	}

	.policy li + li {
		margin-top: var(--space-12);
	}

	.policy a {
		color: var(--color-accent);
	}

	@media (min-width: 640px) {
		.policy {
			padding: var(--space-48);
		}
	}
</style>
