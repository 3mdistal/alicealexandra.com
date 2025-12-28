<script lang="ts">
	import type { BlogPostMeta } from '$lib/content/blog';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	export let accent: string;
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
{#each posts as post}
	<div class="post-item">
		<p class="post-title-wrapper">
			<a href="/blog/{post.slug}" class="post-title-link">
				{post.title}
			</a>
		</p>
		{#if post.subtitle}
			<p class="post-subtitle">{post.subtitle}</p>
		{/if}
		<p class="post-date">{post.formattedPublicationDate}</p>
		<div class="post-category-wrapper">
			<p class="post-category">{post.category}</p>
		</div>
	</div>
{/each}

<style>
	.posts-title {
		margin-bottom: 1em;
		font-weight: 500;
		font-size: 4rem;
	}

	.post-item {
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin-bottom: 3rem;

		@media (min-width: 768px) {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}

	.post-title-wrapper {
		grid-column: span 2;
		margin-bottom: 0;
	}

	.post-title-link {
		transition: color 0.15s ease;
		color: white;
		font-weight: 500;
		font-size: var(--prose-heading-medium);
		line-height: 1;
		font-family: 'Spectral', serif;

		@media (max-width: 768px) {
			font-size: 1.75rem;
		}

		&:hover {
			color: var(--prose-heading-dark);
		}

		&:active {
			color: var(--prose-secondary-dark);
		}
	}

	.post-subtitle {
		grid-row-start: 2;
		grid-column: span 2;
		margin-bottom: 0.5em;
		max-width: var(--prose-subtitle-width);
		color: var(--prose-heading-dark);
		font-style: italic;
		font-size: var(--prose-body);
		line-height: 1;
		text-wrap: balance;
	}

	.post-date {
		grid-row-start: 3;
		color: var(--prose-heading-dark);

		@media (min-width: 768px) {
			grid-row-start: 1;
			grid-column-start: 3;
		}
	}

	.post-category-wrapper {
		display: flex;
		grid-column-start: 2;
		justify-content: flex-end;

		@media (min-width: 768px) {
			grid-column-start: 1;
			justify-content: flex-start;
		}
	}

	.post-category {
		color: var(--prose-heading-dark);

		@media (max-width: 768px) {
			display: none;
		}
	}
</style>
