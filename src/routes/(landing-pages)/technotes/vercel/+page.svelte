<script lang="ts">
	import PublicationsSection from './publications-section.svelte';
	import type { ProfessionalPublications } from './+page.server';
	import { onMount } from 'svelte';
	import { useBackgroundRevalidation } from '$lib/utils/revalidation';

	export let data: Data;

	type Data = {
		publicationList: {
			results: Array<ProfessionalPublications>;
		};
	};

	const {
		publicationList: { results: publications }
	} = data;

	const accent = '#642e1a';
	const background = '#dcc9c6';

	onMount(() => {
		// Trigger background revalidation for future visitors
		useBackgroundRevalidation('/technotes/vercel');
	});
</script>

<svelte:head>
	<title>Vercel Work | Technotes</title>
	<meta name="description" content="The work accomplished at Vercel by Alice Alexandra Moore." />
</svelte:head>

<main style="background-color: {background}">
	<div class="hero">
		<div class="hero-content">
			<h1 style="color: {accent}">
				Work from <span class="highlight">Vercel</span>
			</h1>
			<p class="subtitle">
				Content I published while working at Vercel (2022-2025).
			</p>
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
		<a href="/technotes" class="back-link">← Back to Technotes</a>
	</div>
</main>

<style>
	main {
		min-height: 100vh;
		font-family: 'Spectral', serif;
	}

	.hero {
		background: linear-gradient(135deg, #642e1a 0%, #8b4513 100%);
		padding: 6rem 2rem 4rem;
		text-align: center;
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
		background-color: rgba(255, 255, 255, 0.9);
		border-radius: 15px;
		padding: 3rem;
	}

	h1 {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 500;
		margin-bottom: 1rem;
		line-height: 1.2;
	}

	.highlight {
		color: #642e1a;
		font-weight: 500;
		font-family: 'Spectral', serif;
	}

	.back-link {
		display: inline-block;
		color: #642e1a;
		text-decoration: none;
		font-size: 1rem;
		font-weight: 500;
		margin-bottom: 1.5rem;
		padding: 0.5rem 1rem;
		border: 2px solid #642e1a;
		border-radius: 8px;
		transition: all 0.2s ease;
		background-color: rgba(255, 255, 255, 0.8);
	}

	.back-link:hover {
		background-color: #642e1a;
		color: white;
		transform: translateX(-2px);
	}

	.subtitle {
		font-size: clamp(1.1rem, 2.5vw, 1.4rem);
		color: #555;
		font-style: italic;
		margin: 0;
	}

	.content {
		padding: 4rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.footer {
		padding: 2rem;
		text-align: center;
		border-top: 1px solid rgba(100, 46, 26, 0.2);
		margin-top: 2rem;
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
