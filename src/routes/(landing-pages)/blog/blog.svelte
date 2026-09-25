<script lang="ts">
	import type { BlogPostMeta } from '$lib/content/blog';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	export let accent: string = 'var(--color-accent)';
	export let posts: BlogPostMeta[];

	onMount(async () => {
		// Set accent color based on URL
		page.url.searchParams.forEach((value, key) => {
			if (key === 'accent') {
				accent = value;
			}
		});
	});
</script>

<h1 class="posts-title" style="color: {accent}">Posts</h1>
<ul class="post-list">
	{#each posts as post}
		<li class="post-item">
			<h2 class="post-title-wrapper">
				<a href="/blog/{post.slug}" class="post-title-link">
					{post.title}
				</a>
			</h2>
			{#if post.subtitle}
				<p class="post-subtitle">{post.subtitle}</p>
			{/if}
			<p class="post-date">{post.formattedPublicationDate}</p>
			<p class="post-category">{post.category}</p>
		</li>
	{/each}
</ul>

<style>
	.posts-title {
		margin-bottom: 1em;
		font-weight: 500;
		font-size: 4rem;
	}

	.post-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* Phones: title, subtitle, then one meta line ("Lyric · September 10, 2026"). */
	.post-item {
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: var(--space-2);
		margin-bottom: 3rem;

		/* The title takes the free width; the date column hugs the date. */
		@media (min-width: 768px) {
			grid-template-columns: minmax(0, 1fr) auto;
			column-gap: var(--space-7);
		}
	}

	.post-title-wrapper {
		grid-column: span 2;
		margin: 0;
		font-weight: inherit;
		font-size: inherit;

		@media (min-width: 768px) {
			grid-column: 1;
			align-self: baseline;
		}
	}

	.post-title-link {
		transition: color 0.15s ease;
		color: var(--color-text);
		font-weight: 500;
		font-size: var(--content-font-size-heading-md);
		line-height: 1.15;
		font-family: var(--font-serif);

		@media (max-width: 767px) {
			font-size: 1.75rem;
		}

		&:hover {
			color: var(--color-accent-strong);
		}

		&:active {
			color: var(--color-text-muted);
		}
	}

	.post-subtitle {
		grid-row-start: 2;
		grid-column: span 2;
		margin: var(--space-2) 0 var(--space-4);
		max-width: var(--content-measure-subtitle);
		color: var(--color-text);
		font-style: italic;
		font-size: var(--content-font-size-body);
		line-height: 1.35;
		text-wrap: balance;

		@media (min-width: 768px) {
			grid-column: 1;
		}
	}

	.post-date {
		grid-row-start: 3;
		grid-column-start: 2;
		color: var(--color-text-muted);

		&::before {
			margin-right: var(--space-2);
			content: '·';
			content: '·' / '';
		}

		@media (min-width: 768px) {
			grid-row-start: 1;
			align-self: baseline;

			&::before {
				content: none;
			}
		}
	}

	.post-category {
		grid-row-start: 3;
		grid-column-start: 1;
		color: var(--color-text-muted);
	}
</style>
