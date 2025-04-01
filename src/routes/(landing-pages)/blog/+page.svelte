<script lang="ts">
	import type { PageData } from './$types';
	import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { state } from '$lib/stores';
	import { fade } from 'svelte/transition';

	interface NotionProperties {
		Slug: { id: string; type: 'url'; url: string };
		Name: { id: 'title'; type: 'title'; title: Array<{ plain_text: string }> };
		Description: { id: string; type: 'rich_text'; rich_text: Array<{ plain_text: string }> };
		'Publication Date': {
			id: string;
			type: 'date';
			date: { start: string; end: null; time_zone: null };
		};
		Category: { id: string; type: 'select'; select: { id: string; name: string; color: string } };
		Cover: { id: string; type: 'files'; files: Array<{ file: { url: string } }> };
	}

	export let data: PageData;
	const { post } = data;

	const accent = '#d1dce7';

	function fadeIn() {
		gsap.to(['.blog-header', '.blog-content'], {
			duration: 0.8,
			opacity: 1,
			y: 0,
			stagger: 0.2,
			ease: 'power2.out'
		});

		gsap.to('.blog-post-preview', {
			duration: 0.6,
			opacity: 1,
			y: 0,
			stagger: 0.1,
			delay: 0.4,
			ease: 'power2.out'
		});
	}

	onMount(() => {
		fadeIn();
	});

	onDestroy(() => {
		state.set('home');
	});

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Blog | Alice Alexandra Moore</title>
	<meta name="description" content="Thoughts on software development, design, and life." />
</svelte:head>

<div class="blog-page">
	<div class="blog-background">
		<div class="blog-background-overlay"></div>
	</div>

	<header class="blog-header">
		<h1>Blog</h1>
		<p>Thoughts on software development, design, and life.</p>
	</header>

	<div class="blog-content">
		{#if post?.results?.length}
			{#each post.results as blogPost}
				{@const properties = (blogPost as PageObjectResponse)
					.properties as unknown as NotionProperties}
				<div class="blog-post-preview">
					<div class="preview-content">
						<h2>{properties.Name?.title[0]?.plain_text || ''}</h2>
						<p class="preview-description">
							{properties.Description?.rich_text[0]?.plain_text || ''}
						</p>
						<div class="preview-meta">
							<time datetime={properties['Publication Date']?.date?.start || ''}>
								{formatDate(properties['Publication Date']?.date?.start || '')}
							</time>
							<span class="preview-category"
								>{properties.Category?.select?.name || 'Uncategorized'}</span
							>
						</div>
						<a href="/blog/{properties.Slug?.url || ''}" class="read-more">Read article</a>
					</div>
					{#if properties.Cover?.files[0]?.file?.url}
						<img
							src={properties.Cover.files[0].file.url}
							alt={properties.Name?.title[0]?.plain_text || ''}
							class="preview-image"
						/>
					{/if}
				</div>
			{/each}
		{:else}
			<div class="no-posts">
				<p>No blog posts available at the moment.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.blog-page {
		position: relative;
		background-color: var(--blog-bg-light);
		padding: 2rem 1rem;
		min-height: 100vh;
	}

	.blog-header {
		transform: translateY(20px);
		opacity: 0;
		margin: 0 auto 3rem;
		padding-top: 3rem;
		max-width: 800px;
		text-align: center;
	}

	.blog-header h1 {
		margin-bottom: var(--blog-spacing-sm);
		color: var(--blog-heading-light);
		font-weight: 600;
		font-size: var(--blog-heading-large);
		line-height: 1.1;
		font-family: var(--font-heading);
	}

	.blog-header p {
		margin-right: auto;
		margin-left: auto;
		max-width: 60ch;
		color: var(--blog-secondary-light);
		font-size: var(--blog-body-large);
		line-height: 1.6;
		font-family: var(--font-primary);
	}

	.blog-content {
		position: relative;
		transform: translateY(20px);
		opacity: 0;
		z-index: 20;
		margin: 0 auto;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		border: 1px solid var(--blog-border-light);
		border-radius: var(--blog-border-radius);
		background: var(--blog-bg-light);
		padding: var(--blog-spacing-lg);
		width: 100%;
		max-width: 1200px;
	}

	.blog-post-preview {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--blog-spacing-lg);
		transform: translateY(20px);
		opacity: 0;
		transition:
			transform var(--transition-fast) ease-in-out,
			box-shadow var(--transition-fast) ease-in-out,
			background-color var(--transition-fast) ease-in-out;
		margin-bottom: var(--blog-spacing-lg);
		border: 1px solid var(--blog-border-light);
		border-radius: var(--blog-border-radius);
		background-color: var(--blog-bg-light);
		padding: var(--blog-spacing-md);
	}

	.blog-post-preview:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
		border-color: color-mix(in srgb, var(--blog-border-light) 80%, var(--blog-secondary-light));
		background-color: var(--blog-callout-light);
	}

	.preview-content {
		flex: 1;
	}

	.preview-content h2 {
		margin-bottom: var(--blog-spacing-sm);
		color: var(--blog-heading-light);
		font-weight: 600;
		font-size: var(--blog-heading-medium);
		font-family: var(--font-heading);
	}

	.preview-description {
		opacity: 1;
		margin-bottom: var(--blog-spacing-md);
		color: var(--blog-text-light);
		font-size: var(--blog-body);
		line-height: 1.6;
		font-family: var(--font-primary);
	}

	.preview-meta {
		display: flex;
		align-items: center;
		gap: var(--blog-spacing-sm);
		margin-bottom: var(--blog-spacing-sm);
		color: var(--blog-secondary-light);
		font-size: var(--blog-body-small);
		font-family: var(--font-primary);
	}

	.preview-category {
		opacity: 1;
		border-radius: 999px;
		background: var(--blog-inline-code-bg-light);
		padding: var(--blog-spacing-xs) var(--blog-spacing-sm);
		color: color-mix(in srgb, var(--blog-text-light) 80%, white);
	}

	.read-more {
		display: inline-block;
		transition: all var(--transition-fast) ease-in-out;
		border: 1px solid var(--blog-border-light);
		border-radius: var(--blog-border-radius-sm);
		padding: var(--blog-spacing-xs) var(--blog-spacing-sm);
		color: var(--blog-link-light);
		font-size: var(--blog-body-small);
		font-family: var(--font-primary);
		text-decoration: none;
	}

	.read-more:hover {
		border-color: var(--blog-secondary-light);
		background: var(--blog-callout-light);
		color: var(--blog-heading-light);
	}

	.preview-image {
		border-radius: var(--blog-border-radius);
		width: 200px;
		height: 200px;
		object-fit: cover;
	}

	.no-posts {
		padding: var(--blog-spacing-xl);
		color: var(--blog-secondary-light);
		font-size: var(--blog-body-large);
		font-family: var(--font-primary);
		text-align: center;
	}

	@media (max-width: 768px) {
		.blog-header h1 {
			font-size: var(--blog-heading-medium);
		}

		.blog-content {
			padding: var(--blog-spacing-md);
		}

		.blog-post-preview {
			grid-template-columns: 1fr;
		}

		.preview-image {
			order: -1;
			width: 100%;
			height: 200px;
		}
	}

	@media (min-width: 1024px) {
		.blog-page {
			padding: 3rem;
		}

		.blog-header {
			margin-bottom: 4rem;
		}
	}
</style>
