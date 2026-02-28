<script lang="ts">
	import type { BuilderSnapshot } from './+page.server';

	export let data: { snapshot: BuilderSnapshot };

	const snapshot = data.snapshot;
	const posts = snapshot?.data ?? [];

	const formatDate = (value?: string) => {
		if (!value) return '';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '';
		return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
	};
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
			<p class="hero-subtitle">
				Blog posts and technical writing from my current role (2025&ndash;present).
			</p>
		</div>
	</div>

	<div class="content">
		<section class="posts-section">
			<h2 class="posts-section-title">Builder.io Blog Posts</h2>
			<p class="posts-section-subtitle">Selected writing published on Builder.io&apos;s blog.</p>
			{#if posts.length === 0}
				<p class="empty-state">Posts are being gathered. Please check back soon.</p>
			{:else}
				<ul class="posts-list">
					{#each posts as post}
						<li class="post-item">
							<a href={post.url} target="_blank" rel="noopener noreferrer" class="post-link">
								<div class="post-header">
									<h3 class="post-title">{post.title}</h3>
									{#if formatDate(post.publishedAt)}
										<span class="post-date">{formatDate(post.publishedAt)}</span>
									{/if}
								</div>
								{#if post.description}
									<p class="post-description">{post.description}</p>
								{/if}
								<div class="read-more">Read <span class="arrow">→</span></div>
							</a>
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
	.posts-section {
		margin-bottom: 5rem;
		box-shadow: var(--shadow-2);
		border-radius: var(--radius-3);
		background-color: var(--color-surface);
		padding: 2.5rem;
	}

	.posts-section-title {
		margin-bottom: 1rem;
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-2xl);
		font-family: var(--font-serif);
	}

	.posts-section-subtitle {
		margin-bottom: 2.5rem;
		color: var(--color-text-muted);
		font-style: italic;
		font-size: var(--font-size-lg);
		line-height: var(--line-height-body);
	}

	.posts-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.post-item {
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 1.5rem;
	}

	.post-item:last-child {
		margin-bottom: 0;
		border-bottom: none;
		padding-bottom: 0;
	}

	.post-link {
		display: block;
		transition: all 0.3s ease;
		margin: -1rem;
		border-radius: var(--radius-2);
		padding: 1rem;
		text-decoration: none;
	}

	.post-link:hover {
		transform: translateY(-2px);
		background-color: var(--color-surface-muted);
	}

	.post-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.post-title {
		transition: color 0.2s ease;
		margin: 0;
		color: var(--color-text);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-lg);
		line-height: var(--line-height-tight);
		font-family: var(--font-serif);
	}

	.post-link:hover .post-title {
		color: var(--color-accent);
	}

	.post-date {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		font-family: var(--font-mono);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.post-description {
		margin: 0 0 1rem 0;
		color: var(--color-text-muted);
		font-style: italic;
		font-size: var(--font-size-base);
		line-height: var(--line-height-body);
	}

	.empty-state {
		margin: 0;
		color: var(--color-text-muted);
		font-style: italic;
	}

	.read-more {
		display: inline-flex;
		align-items: center;
		opacity: 0.8;
		transition: opacity 0.2s ease;
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-sm);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.post-link:hover .read-more {
		opacity: 1;
	}

	.arrow {
		transition: transform 0.2s ease;
		margin-left: 0.25rem;
	}

	.post-link:hover .arrow {
		transform: translateX(4px);
	}

	@media (min-width: 640px) {
		.posts-section {
			padding: 3rem;
		}

		.post-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: baseline;
		}

		.post-date {
			flex-shrink: 0;
			margin-left: 1rem;
		}
	}

	@media (min-width: 768px) {
		.posts-section-title {
			font-size: var(--font-size-3xl);
		}

		.post-title {
			font-size: var(--font-size-xl);
		}
	}
</style>
