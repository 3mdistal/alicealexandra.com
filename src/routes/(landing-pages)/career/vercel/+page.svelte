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
			<p class="hero-subtitle">Content I published while working at Vercel (2022&ndash;2025).</p>
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
