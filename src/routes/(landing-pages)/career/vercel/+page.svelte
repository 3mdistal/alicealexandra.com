<script lang="ts">
	import PublicationsSection from './publications-section.svelte';
	import type { Publication } from '$lib/content/career';

	export let data: { publications: Publication[] };

	const { publications } = data;

	const accent = '#642e1a';
	const background = '#dcc9c6';
</script>

<svelte:head>
	<title>Vercel Work | Career</title>
	<meta name="description" content="The work accomplished at Vercel by Alice Alexandra Moore." />
</svelte:head>

<main class="career-detail-surface" style="--bg-color: {background}; --accent-color: {accent}">
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
			{accent}
		/>
		<PublicationsSection
			{publications}
			title="Technical Guides"
			subtitle="In-depth technical guides and tutorials for developers."
			type="Technical Guide"
			{accent}
		/>
		<PublicationsSection
			{publications}
			title="Enterprise Resources"
			subtitle="Deep dives I've targeted at specific industries of enterprise buyers."
			type="Enterprise Resource"
			{accent}
		/>
		<PublicationsSection
			{publications}
			title="Product Features"
			subtitle="Announcements and feature highlights I've collaborated with company leaders to ghostwrite."
			type="Product Feature"
			{accent}
		/>
		<PublicationsSection
			{publications}
			title="Customer Stories"
			subtitle="My profiles of customers who have experienced big wins with Vercel."
			type="Customer Story"
			{accent}
		/>
	</div>

	<div class="footer">
		<a href="/career" class="back-link">← Back to Career</a>
	</div>
</main>

<style>
	.career-detail-surface {
		background-color: var(--bg-color);
		min-height: 100vh;
		font-family: 'Spectral', serif;
	}

	.accent-color {
		color: var(--accent-color);
	}

	.hero {
		background: linear-gradient(135deg, #642e1a 0%, #8b4513 100%);
		padding: 6rem 2rem 4rem;
		text-align: center;
	}

	.hero-content {
		margin: 0 auto;
		border-radius: 15px;
		background-color: #f4efea;
		padding: 3rem;
		max-width: 800px;
	}

	h1 {
		margin-bottom: 1rem;
		font-weight: 500;
		font-size: clamp(2rem, 5vw, 3.5rem);
		line-height: 1.2;
	}

	.highlight {
		color: #642e1a;
		font-weight: 500;
		font-family: 'Spectral', serif;
	}

	.back-link {
		display: inline-block;
		transition: all 0.2s ease;
		margin-bottom: 1.5rem;
		border: 2px solid #642e1a;
		border-radius: 8px;
		background-color: #f4efea;
		padding: 0.5rem 1rem;
		color: #642e1a;
		font-weight: 500;
		font-size: 1rem;
		text-decoration: none;
	}

	.back-link:hover {
		transform: translateX(-2px);
		background-color: #642e1a;
		color: white;
	}

	.subtitle {
		margin: 0;
		color: #555;
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
		border-top: 1px solid rgba(100, 46, 26, 0.2);
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
