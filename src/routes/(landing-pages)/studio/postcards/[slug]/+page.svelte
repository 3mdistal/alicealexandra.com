<script lang="ts">
	import { marked } from 'marked';

	let { data } = $props();

	const postcard = data.postcard;
	const htmlContent = marked(postcard.content) as string;
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
				<div class="notion-container">
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
		width: 100vw;
		aspect-ratio: 3 / 2;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		position: relative;
		left: 50%;
		right: 50%;
		margin-left: -50vw;
		margin-right: -50vw;
	}

	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		line-height: 1.6;
		background-color: #e8e8e8;
		min-height: 100vh;
	}

	header {
		margin-bottom: 3rem;
		padding-top: 2rem;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.description {
		font-size: 1.2rem;
		color: #666;
		margin-bottom: 2rem;
		font-style: italic;
	}

	.postcard-content {
		margin-bottom: 3rem;
	}

	.notion-container {
		font-size: 1.1rem;
		line-height: 1.7;
	}

	.notion-container :global(p) {
		margin-bottom: 1.5rem;
	}

	.notion-container :global(h2) {
		font-size: 1.8rem;
		margin-top: 2rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.notion-container :global(h3) {
		font-size: 1.4rem;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: #333;
	}

	.notion-container :global(blockquote) {
		border-left: 3px solid #ddd;
		padding-left: 1rem;
		margin: 1.5rem 0;
		font-style: italic;
		color: #666;
	}

	.notion-container :global(code) {
		background-color: #f4f4f4;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Courier New', monospace;
	}

	.notion-container :global(pre) {
		background-color: #f4f4f4;
		padding: 1rem;
		border-radius: 6px;
		overflow-x: auto;
		margin: 1rem 0;
	}

	.notion-container :global(pre code) {
		background: none;
		padding: 0;
	}

	.back-link {
		text-align: center;
		margin-top: 9rem;
	}

	.back-link a {
		color: #666;
		text-decoration: none;
		font-size: 1.1rem;
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.back-link a:hover {
		background-color: #f8f8f8;
	}

	.not-found {
		text-align: center;
		margin-top: 4rem;
	}

	.not-found h1 {
		color: #666;
	}

	.not-found p {
		color: #999;
		margin-bottom: 2rem;
	}

	.not-found a {
		color: #666;
		text-decoration: none;
		font-size: 1.1rem;
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.not-found a:hover {
		background-color: #f8f8f8;
	}
</style>
