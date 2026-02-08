<script lang="ts">
	import CareerDetailShell from '$lib/components/career-detail-shell.svelte';
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

<CareerDetailShell
	title="Work from"
	highlight="Builder.io"
	subtitle="Blog posts and technical writing from my current role (2025-present)."
>
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
</CareerDetailShell>

<style>
	.posts-section {
		box-shadow: var(--shadow-1);
		border-radius: var(--radius-3);
		background-color: var(--color-surface);
		padding: var(--space-7);
	}

	.section-title {
		margin-bottom: var(--space-4);
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
		font-size: 2rem;
	}

	.section-subtitle {
		margin-bottom: var(--space-7);
		color: var(--color-text-muted);
		font-style: italic;
		font-size: 1.125rem;
		line-height: var(--line-height-body);
	}

	.freshness {
		margin: 0 0 var(--space-3);
		color: var(--color-text-muted);
		font-size: var(--font-size-base);
	}

	.disclaimer {
		margin: calc(var(--space-5) * -1) 0 var(--space-7);
		color: var(--color-text-muted);
		font-style: italic;
		font-size: var(--font-size-base);
		line-height: var(--line-height-body);
	}

	.posts {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.post-item {
		margin-bottom: var(--space-6);
		border-bottom: 1px solid var(--color-border);
		padding-bottom: var(--space-5);
	}

	.post-item:last-child {
		margin-bottom: 0;
		border-bottom: none;
	}

	.post-item a {
		display: block;
		transition: transform var(--duration-base) var(--ease-standard);
		text-decoration: none;
	}

	.post-item a:hover {
		transform: translateX(var(--space-2));
	}

	.item-title {
		transition: color var(--duration-base) var(--ease-standard);
		margin-bottom: var(--space-2);
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
		font-size: 1.25rem;
	}

	.post-item a:hover .item-title {
		text-decoration: underline;
	}

	.description {
		margin: 0 0 var(--space-2);
		color: var(--color-text-muted);
		font-style: italic;
		font-size: var(--font-size-base);
		line-height: var(--line-height-body);
	}

	.meta {
		margin: 0;
		color: var(--color-text-muted);
		font-size: var(--font-size-base);
	}

	.empty-state {
		margin: 0;
		color: var(--color-text-muted);
		font-style: italic;
	}

	@media (min-width: 640px) {
		.posts-section {
			padding: var(--space-8);
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
		.section-title {
			font-size: 2.5rem;
		}

		.item-title {
			font-size: 1.5rem;
		}
	}

	@media (min-width: 1024px) {
		.posts-section {
			padding: calc(var(--space-8) + var(--space-3));
		}
	}
</style>
