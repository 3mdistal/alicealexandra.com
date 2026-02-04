<script lang="ts">
	import type { BuilderSnapshot } from './+page.server';

	export let data: { snapshot: BuilderSnapshot };

	const snapshot = data.snapshot;
	const posts = snapshot?.data ?? [];

	const formatter = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const formatDate = (value?: string) => {
		if (!value) {
			return '';
		}
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return '';
		}
		return formatter.format(date);
	};

	const lastUpdated = formatDate(snapshot?.dataUpdatedAt);
	const scrapedOn = formatDate(snapshot?.generatedAt);
</script>

<svelte:head>
	<title>Builder.io Work | Career</title>
	<meta
		name="description"
		content="Blog posts and technical writing authored by Alice Alexandra Moore at Builder.io."
	/>
</svelte:head>

<main class="career-detail-surface">
	<div class="hero">
		<div class="hero-content">
			<h1 class="accent-color">
				Work from <span class="highlight">Builder.io</span>
			</h1>
			<p class="subtitle">Blog posts and technical writing from my current role (2025-present).</p>
		</div>
	</div>

	<div class="content">
		<section class="posts-section">
			<h2 class="section-title">Builder.io Blog Posts</h2>
			{#if lastUpdated}
				<p class="freshness">
					Last updated {lastUpdated}
					{#if scrapedOn && scrapedOn !== lastUpdated}
						· Scraped {scrapedOn}
					{/if}
				</p>
			{/if}
			<p class="section-subtitle">Selected writing published on Builder.io&apos;s blog.</p>
			<p class="disclaimer">This list is updated manually and may not include every post.</p>
			{#if posts.length === 0}
				<p class="empty-state">Posts are being gathered. Please check back soon.</p>
			{:else}
				<ul class="posts">
					{#each posts as post}
						<li class="post-item">
							<a href={post.url} target="_blank" rel="noopener noreferrer">
								<h3 class="item-title">{post.title}</h3>
							</a>
							{#if post.description}
								<p class="description">{post.description}</p>
							{/if}
							{#if formatDate(post.publishedAt)}
								<p class="meta">{formatDate(post.publishedAt)}</p>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</section>
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
		background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-strong) 100%);
		padding: 6rem 2rem 4rem;
		text-align: center;
	}

	.hero-content {
		margin: 0 auto;
		border-radius: 15px;
		background-color: var(--color-surface);
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
		color: var(--color-accent);
		font-weight: 500;
		font-family: var(--font-serif);
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

	.posts-section {
		box-shadow: var(--shadow-1);
		border-radius: 10px;
		background-color: var(--color-surface);
		padding: 2.5rem;
	}

	.section-title {
		margin-bottom: 1rem;
		color: var(--color-accent);
		font-weight: 500;
		font-size: 2rem;
		font-family: var(--font-serif);
	}

	.section-subtitle {
		margin-bottom: 2.5rem;
		color: var(--color-text-muted);
		font-style: italic;
		font-size: 1.125rem;
		line-height: 1.6;
	}

	.freshness {
		margin: 0 0 0.75rem;
		color: var(--color-text-muted);
		font-size: 1rem;
	}

	.disclaimer {
		margin: -1.5rem 0 2.5rem;
		color: var(--color-text-muted);
		font-style: italic;
		font-size: 1rem;
		line-height: 1.6;
	}

	.posts {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.post-item {
		margin-bottom: 2rem;
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 1.5rem;
	}

	.post-item:last-child {
		margin-bottom: 0;
		border-bottom: none;
	}

	.post-item a {
		display: block;
		transition: transform 0.2s ease;
		text-decoration: none;
	}

	.post-item a:hover {
		transform: translateX(5px);
	}

	.item-title {
		transition: color 0.2s ease;
		margin-bottom: 0.5rem;
		color: var(--color-accent);
		font-weight: 500;
		font-size: 1.25rem;
		font-family: var(--font-serif);
	}

	.post-item a:hover .item-title {
		filter: brightness(1.2);
		text-decoration: underline;
	}

	.description {
		margin: 0 0 0.5rem;
		color: var(--color-text-muted);
		font-style: italic;
		font-size: 1rem;
		line-height: 1.5;
	}

	.meta {
		margin: 0;
		color: var(--color-text-muted);
		font-size: 0.95rem;
	}

	.empty-state {
		margin: 0;
		color: var(--color-text-muted);
		font-style: italic;
	}

	.footer {
		margin-top: 2rem;
		border-top: 1px solid var(--color-border);
		padding: 2rem;
		text-align: center;
	}

	.back-link {
		display: inline-block;
		transition: all 0.2s ease;
		border: 2px solid var(--color-accent);
		border-radius: 8px;
		background-color: var(--color-surface);
		padding: 0.5rem 1rem;
		color: var(--color-accent);
		font-weight: 500;
		font-size: 1rem;
		text-decoration: none;
	}

	.back-link:hover {
		transform: translateX(-2px);
		background-color: var(--color-accent);
		color: var(--color-surface);
	}

	@media (min-width: 640px) {
		.posts-section {
			padding: 3rem;
		}

		.section-title {
			font-size: 2.25rem;
		}

		.section-subtitle {
			font-size: 1.25rem;
		}

		.item-title {
			font-size: 1.375rem;
		}

		.description {
			font-size: 1.125rem;
		}
	}

	@media (min-width: 768px) {
		.hero {
			padding: 8rem 4rem 6rem;
		}

		.content {
			padding: 6rem 4rem;
		}

		.section-title {
			font-size: 2.5rem;
		}

		.item-title {
			font-size: 1.5rem;
		}
	}

	@media (min-width: 1024px) {
		.content {
			padding: 8rem 6rem;
		}
	}
</style>
