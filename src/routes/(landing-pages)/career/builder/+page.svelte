<script lang="ts">
	import type { BuilderSnapshot } from './+page.server';

	export let data: { snapshot: BuilderSnapshot };

	const snapshot = data.snapshot;
	const posts = snapshot?.data ?? [];

	const accent = '#642e1a';
	const background = '#dcc9c6';

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

<main class="career-detail-surface" style="--bg-color: {background}; --accent-color: {accent}">
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

	.posts-section {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border-radius: 10px;
		background-color: #f4efea;
		padding: 2.5rem;
	}

	.section-title {
		margin-bottom: 1rem;
		color: var(--accent-color);
		font-weight: 500;
		font-size: 2rem;
		font-family: 'Spectral', serif;
	}

	.section-subtitle {
		margin-bottom: 2.5rem;
		color: #666;
		font-style: italic;
		font-size: 1.125rem;
		line-height: 1.6;
	}

	.freshness {
		margin: 0 0 0.75rem;
		color: #555;
		font-size: 1rem;
	}

	.disclaimer {
		margin: -1.5rem 0 2.5rem;
		color: #666;
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
		border-bottom: 1px solid rgba(100, 46, 26, 0.2);
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
		color: var(--accent-color);
		font-weight: 500;
		font-size: 1.25rem;
		font-family: 'Spectral', serif;
	}

	.post-item a:hover .item-title {
		filter: brightness(1.2);
		text-decoration: underline;
	}

	.description {
		margin: 0 0 0.5rem;
		color: #555;
		font-style: italic;
		font-size: 1rem;
		line-height: 1.5;
	}

	.meta {
		margin: 0;
		color: #777;
		font-size: 0.95rem;
	}

	.empty-state {
		margin: 0;
		color: #666;
		font-style: italic;
	}

	.footer {
		margin-top: 2rem;
		border-top: 1px solid rgba(100, 46, 26, 0.2);
		padding: 2rem;
		text-align: center;
	}

	.back-link {
		display: inline-block;
		transition: all 0.2s ease;
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
