<script lang="ts">
	import '$lib/styles/prose.css';
	import { marked } from 'marked';

	let { data } = $props();

	const postcard = $derived(data.postcard);
	const htmlContent = $derived(marked.parse(postcard.content));
</script>

<svelte:head>
	<title>{postcard.title || 'Postcard'}</title>
	<meta name="description" content={postcard.description} />
	<meta name="og:title" content={postcard.title || 'Postcard'} />
	<meta name="og:description" content={postcard.description} />
	{#if postcard.heroImage}
		<meta name="og:image" content={postcard.heroImage} />
	{/if}
</svelte:head>

{#if postcard && postcard.heroImage}
	<div
		class="hero-image"
		style="background-image: url('{postcard.heroImage}'); view-transition-name: postcard-hero-{postcard.slug}"
	></div>
{/if}

<main>
	{#if postcard}
		<header>
			<h1>{postcard.title}</h1>
			{#if postcard.description}
				<p class="description">{postcard.description}</p>
			{/if}
		</header>

		<article class="postcard-content">
			{#if htmlContent}
				<div class="prose">
					{@html htmlContent}
				</div>
			{:else}
				<p>No content available.</p>
			{/if}
		</article>

		<nav class="back-link">
			<a href="/studio/postcards">← Back to Postcards</a>
		</nav>
	{:else}
		<div class="not-found">
			<h1>Postcard not found</h1>
			<p>The postcard you're looking for doesn't exist.</p>
			<a href="/studio/postcards">← Back to Postcards</a>
		</div>
	{/if}
</main>

<style>
	.hero-image {
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		aspect-ratio: 3 / 2;
		width: 100vw;
	}

	main {
		margin: 0 auto;
		background-color: #e8e8e8;
		padding: 2rem;
		max-width: 800px;
		min-height: 100vh;
		line-height: 1.6;
	}

	header {
		margin-bottom: 3rem;
		padding-top: 2rem;
	}

	h1 {
		margin-bottom: 1rem;
		color: #333;
		font-size: 2.5rem;
	}

	.description {
		margin-bottom: 2rem;
		color: #666;
		font-style: italic;
		font-size: 1.2rem;
	}

	.postcard-content {
		margin-bottom: 3rem;
	}

	/* Prose styles are now imported from $lib/styles/prose.css */

	.back-link {
		margin-top: 9rem;
		text-align: center;
	}

	.back-link a {
		transition: background-color 0.2s;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 0.5rem 1rem;
		color: #666;
		font-size: 1.1rem;
		text-decoration: none;
	}

	.back-link a:hover {
		background-color: #f8f8f8;
	}

	.not-found {
		margin-top: 4rem;
		text-align: center;
	}

	.not-found h1 {
		color: #666;
	}

	.not-found p {
		margin-bottom: 2rem;
		color: #999;
	}

	.not-found a {
		transition: background-color 0.2s;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 0.5rem 1rem;
		color: #666;
		font-size: 1.1rem;
		text-decoration: none;
	}

	.not-found a:hover {
		background-color: #f8f8f8;
	}
</style>
