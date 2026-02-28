<script lang="ts">
	import PublicationsSection from './publications-section.svelte';
	import type { Publication } from '$lib/content/career';

	export let data: { publications: Publication[] };

	const { publications } = data;
</script>

<svelte:head>
	<title>Vercel Work | Career</title>
	<meta name="description" content="The work accomplished at Vercel by Alice Alexandra Moore." />
</svelte:head>

<main class="career-detail-surface">
	<div class="hero">
		<div class="hero-content">
			<h1 class="accent-color">
				Work from <span class="highlight">Vercel</span>
			</h1>
			<p class="subtitle">Content I published while working at Vercel (2022-2025).</p>
		</div>
	</div>

	<div class="content">
		<PublicationsSection
			{publications}
			title="Technical Blogs"
			subtitle="Articles that I've written to offer developers guidance on Vercel's product."
			type="Technical Blog"
		/>
		<PublicationsSection
			{publications}
			title="Enterprise Resources"
			subtitle="Deep dives I've targeted at specific industries of enterprise buyers."
			type="Enterprise Resource"
		/>
		<PublicationsSection
			{publications}
			title="Product Features"
			subtitle="Announcements and feature highlights I've collaborated with company leaders to ghostwrite."
			type="Product Feature"
		/>
		<PublicationsSection
			{publications}
			title="Customer Stories"
			subtitle="My profiles of customers who have experienced big wins with Vercel."
			type="Customer Story"
		/>
	</div>

	<div class="footer">
		<a href="/career" class="back-link">← Back to Career</a>
	</div>
</main>

<style>
	.career-detail-surface {
		background-color: var(--color-bg);
		min-height: 100vh;
		font-family: var(--font-serif);
	}

	.accent-color {
		color: var(--color-accent);
	}

	.hero {
		position: relative;
		z-index: 10;
		box-shadow: var(--chrome-shadow, 0 12px 40px var(--color-shadow));
		background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-strong) 100%);
		padding: 6rem 2rem 4rem;
		overflow: hidden;
		text-align: center;
	}

	.hero::before {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		opacity: 0.15;
		background-image: radial-gradient(var(--color-surface) 1px, transparent 1px);
		background-size: 24px 24px;
		pointer-events: none;
		content: '';
	}

	.hero-content {
		position: relative;
		z-index: 1;
		margin: 0 auto;
		box-shadow: var(--shadow-2);
		border-radius: var(--radius-4);
		background-color: var(--color-surface);
		padding: 3rem;
		max-width: 800px;
	}

	h1 {
		margin-bottom: 1rem;
		font-weight: var(--font-weight-medium);
		font-size: clamp(2rem, 5vw, 3.5rem);
		line-height: var(--line-height-tight);
	}

	.highlight {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
		font-family: var(--font-serif);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		transition: all var(--duration-fast) var(--ease-standard);
		margin-bottom: 1.5rem;
		border: 2px solid var(--color-accent);
		border-radius: var(--radius-2);
		background-color: transparent;
		padding: 0.75rem 1.5rem;
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-base);
		text-decoration: none;
	}

	.back-link:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-1);
		background-color: var(--color-accent);
		color: var(--color-surface);
	}

	.subtitle {
		margin: 0;
		color: var(--color-text-muted);
		font-style: italic;
		font-size: clamp(1.1rem, 2.5vw, 1.4rem);
	}

	.content {
		margin: 0 auto;
		padding: 4rem 2rem;
		max-width: 1200px;
	}

	.footer {
		margin-top: 2rem;
		border-top: 1px solid var(--color-border);
		padding: 2rem;
		text-align: center;
	}

	@media (min-width: 768px) {
		.hero {
			padding: 8rem 4rem 6rem;
		}

		.content {
			padding: 6rem 4rem;
		}
	}

	@media (min-width: 1024px) {
		.content {
			padding: 8rem 6rem;
		}
	}
</style>
