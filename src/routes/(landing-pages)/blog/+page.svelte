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
		margin-bottom: 1rem;
		color: white;
		font-weight: 600;
		font-size: 3.5rem;
		line-height: 1.1;
	}

	.blog-content {
		position: relative;
		transform: translateY(20px);
		opacity: 0;
		z-index: 20;
		backdrop-filter: blur(10px);
		margin: 0 auto;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.4);
		padding: 2rem;
		width: 100%;
		max-width: 1200px;
	}

	.blog-post-preview {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 2rem;
		transform: translateY(20px);
		opacity: 0;
		transition:
			transform 0.2s ease-in-out,
			background-color 0.2s ease-in-out;
		margin-bottom: 2rem;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.05);
		padding: 1.5rem;
	}

	.blog-post-preview:hover {
		transform: translateY(-2px);
		background: rgba(255, 255, 255, 0.1);
	}

	.preview-content {
		flex: 1;
	}

	.preview-content h2 {
		margin-bottom: 1rem;
		color: white;
		font-weight: 600;
		font-size: 1.75rem;
	}

	.preview-description {
		margin-bottom: 1.5rem;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.6;
	}

	.preview-meta {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.9rem;
	}

	.preview-category {
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.1);
		padding: 0.25rem 0.75rem;
	}

	.read-more {
		display: inline-block;
		transition: all 0.2s ease-in-out;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		padding: 0.5rem 1rem;
		color: white;
		font-size: 0.9rem;
		text-decoration: none;
	}

	.read-more:hover {
		border-color: rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.1);
	}

	.preview-image {
		border-radius: 8px;
		width: 200px;
		height: 200px;
		object-fit: cover;
	}

	.no-posts {
		padding: 3rem;
		color: rgba(255, 255, 255, 0.8);
		font-size: 1.2rem;
		text-align: center;
	}

	@media (max-width: 768px) {
		.blog-header h1 {
			font-size: 2.5rem;
		}

		.blog-content {
			padding: 1.5rem;
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
