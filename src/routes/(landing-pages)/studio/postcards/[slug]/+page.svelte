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
	<div class="hero-container">
		<div
			class="hero-image"
			style="background-image: url('{postcard.heroImage}'); view-transition-name: postcard-hero-{postcard.slug}"
		></div>
		<div class="hero-overlay">
			<div class="hero-content">
				<h1>{postcard.title}</h1>
				{#if postcard.description}
					<p class="description">{postcard.description}</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<main>
	{#if postcard}
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
	.hero-container {
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		width: 100vw;
	}

	.hero-image {
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		aspect-ratio: 3 / 2;
		width: 100%;
		height: 100%;
	}

	.hero-overlay {
		display: flex;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		justify-content: center;
		align-items: flex-end;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, transparent 100%, var(--color-bg)) 0%,
			color-mix(in srgb, transparent 80%, var(--color-bg)) 40%,
			color-mix(in srgb, transparent 35%, var(--color-bg)) 70%,
			var(--color-bg) 100%
		);
		padding: 3rem;
		padding-bottom: 14rem;
	}

	.hero-content {
		max-width: 800px;
		text-align: center;
	}

	.hero-content h1 {
		margin: 0 0 0.75rem 0;
		color: var(--color-text);
		font-weight: 500;
		font-size: 4.4rem;
		line-height: 1.1;
		font-family: 'Spectral', serif;
		letter-spacing: 0.05em;
		text-shadow:
			0 0 25px color-mix(in srgb, var(--color-bg) 70%, transparent),
			0 0 50px color-mix(in srgb, var(--color-bg) 40%, transparent),
			0 2px 4px color-mix(in srgb, var(--color-bg) 25%, transparent);
	}

	.hero-content .description {
		margin: 0;
		color: var(--color-text-muted);
		font-style: italic;
		font-size: 1.75rem;
		line-height: 1.4;
		font-family: 'Spectral', serif;
		letter-spacing: 0.05em;
		text-shadow:
			0 0 20px color-mix(in srgb, var(--color-bg) 70%, transparent),
			0 0 40px color-mix(in srgb, var(--color-bg) 40%, transparent);
	}

	@media (max-width: 768px) {
		.hero-overlay {
			padding: 2rem;
			padding-bottom: 10rem;
		}

		.hero-content h1 {
			font-size: 3rem;
		}

		.hero-content .description {
			font-size: 1.4rem;
		}

		main {
			margin-top: -8rem;
		}
	}

	@media (max-width: 480px) {
		.hero-overlay {
			padding: 1.5rem;
			padding-bottom: 8rem;
		}

		.hero-content h1 {
			font-size: 2.2rem;
		}

		.hero-content .description {
			font-size: 1.1rem;
		}

		main {
			margin-top: -6rem;
		}
	}

	main {
		position: relative;
		z-index: 1;
		margin: -10rem auto 0;
		background-color: transparent;
		padding: 2rem;
		max-width: 800px;
		min-height: 100vh;
		line-height: 1.6;
	}

	.postcard-content {
		margin-bottom: 3rem;
	}

	.back-link {
		margin-top: 9rem;
		text-align: center;
	}

	.back-link a {
		transition: background-color 0.2s;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 0.5rem 1rem;
		color: var(--color-text-muted);
		font-size: 1.1rem;
		text-decoration: none;
	}

	.back-link a:hover {
		background-color: color-mix(in srgb, var(--color-bg) 88%, var(--color-text));
	}

	.not-found {
		margin-top: 4rem;
		text-align: center;
	}

	.not-found h1 {
		color: var(--color-text-muted);
	}

	.not-found p {
		margin-bottom: 2rem;
		color: var(--color-text-muted);
	}

	.not-found a {
		transition: background-color 0.2s;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 0.5rem 1rem;
		color: var(--color-text-muted);
		font-size: 1.1rem;
		text-decoration: none;
	}

	.not-found a:hover {
		background-color: color-mix(in srgb, var(--color-bg) 88%, var(--color-text));
	}
</style>
