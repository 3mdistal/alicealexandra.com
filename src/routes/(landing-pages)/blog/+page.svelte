<script lang="ts">
	import type { PageData } from './$types';
	import type {
		PageObjectResponse,
		RichTextItemResponse
	} from '@notionhq/client/build/src/api-endpoints';
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { state } from '$lib/stores';
	import { fade } from 'svelte/transition';
	import TextMacro from '$lib/notion/components/text-macro.svelte';

	interface NotionProperties {
		Slug: { id: string; type: 'url'; url: string };
		Name: { id: 'title'; type: 'title'; title: Array<{ plain_text: string }> };
		Summary?: { rich_text: Array<RichTextItemResponse> };
		Subtitle?: { rich_text: Array<RichTextItemResponse> };
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

	// Separate featured post from regular posts
	$: featuredPost = post?.results?.length > 0 ? (post.results[0] as PageObjectResponse) : null;
	$: regularPosts = post?.results?.length > 1 ? post.results.slice(1) : [];

	// Re-add log for debugging description
	$: {
		if (featuredPost) {
			const props = featuredPost.properties as unknown as NotionProperties;
			console.log('Featured Post Summary (Client):', props.Summary);
			console.log('Featured Post Subtitle (Client):', props.Subtitle);
			console.log('Featured Post Cover URL (Client):', props.Cover?.files[0]?.file?.url);
		}
	}

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
		{#if featuredPost}
			{@const featuredProperties = featuredPost.properties as unknown as NotionProperties}
			{@const coverUrl = featuredProperties.Cover?.files[0]?.file?.url}
			<!-- Featured Post -->
			<div
				class="blog-post-preview featured-post {coverUrl ? 'has-cover' : ''}"
				style={coverUrl
					? `background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${coverUrl})`
					: ''}
			>
				<div class="preview-content">
					<h2>{featuredProperties.Name?.title[0]?.plain_text || ''}</h2>

					<!-- Render Subtitle (always for featured) -->
					<div class="preview-subtitle">
						{#if featuredProperties.Subtitle?.rich_text}
							<p>
								<TextMacro type={featuredProperties.Subtitle} />
							</p>
						{/if}
					</div>

					<!-- Render Summary (only for featured) -->
					<div class="preview-summary">
						{#if featuredProperties.Summary?.rich_text}
							<p>
								<TextMacro type={featuredProperties.Summary} />
							</p>
						{/if}
					</div>

					<div class="preview-meta">
						<time datetime={featuredProperties['Publication Date']?.date?.start || ''}>
							{formatDate(featuredProperties['Publication Date']?.date?.start || '')}
						</time>
						<span class="preview-category"
							>{featuredProperties.Category?.select?.name || 'Uncategorized'}</span
						>
					</div>
					<a href="/blog/{featuredProperties.Slug?.url || ''}" class="read-more">Read article</a>
				</div>
				<!-- Image is used as background, so no img tag needed here -->
			</div>

			<!-- Separator -->
			{#if regularPosts.length > 0}
				<hr class="featured-separator" />
			{/if}
		{/if}

		<!-- Regular Posts -->
		{#if regularPosts.length > 0}
			{#each regularPosts as blogPost}
				{@const properties = (blogPost as PageObjectResponse)
					.properties as unknown as NotionProperties}
				<div class="blog-post-preview">
					<div class="preview-content">
						<h2>{properties.Name?.title[0]?.plain_text || ''}</h2>

						<!-- Render Subtitle (only for regular) -->
						<div class="preview-subtitle">
							{#if properties.Subtitle?.rich_text}
								<p>
									<TextMacro type={properties.Subtitle} />
								</p>
							{/if}
						</div>

						<!-- Summary is omitted for regular posts -->

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
					<!-- Optional: Only show image for featured? Or keep for regular? Hiding for now -->
					<!-- {#if properties.Cover?.files[0]?.file?.url}
						<img
							src={properties.Cover.files[0].file.url}
							alt={properties.Name?.title[0]?.plain_text || ''}
							class="preview-image"
						/>
					{/if} -->
				</div>
			{/each}
		{:else if !featuredPost}
			<!-- Only show no posts if there's no featured post either -->
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
		grid-template-columns: 1fr;
		gap: var(--blog-spacing-md);
		transform: translateY(20px);
		opacity: 0;
		transition:
			transform var(--transition-fast) ease-in-out,
			box-shadow var(--transition-fast) ease-in-out,
			background-color var(--transition-fast) ease-in-out;
		margin-bottom: var(--blog-spacing-lg);
		border: 1px solid var(--blog-border-light);
		border-radius: var(--blog-border-radius);
		background-position: center;
		background-size: cover;
		background-color: var(--blog-bg-light);
		padding: var(--blog-spacing-md);
	}

	.blog-post-preview:not(.featured-post):hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
		border-color: color-mix(in srgb, var(--blog-border-light) 80%, var(--blog-secondary-light));
		background-color: var(--blog-callout-light);
	}

	.featured-post {
		margin-bottom: var(--blog-spacing-xl);
		border-color: var(--blog-secondary-light);
		padding: var(--blog-spacing-xl);
	}

	.featured-post.has-cover {
		border: none;
		color: white;
	}

	.featured-post.has-cover .preview-content h2 {
		color: white;
		text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
	}

	.featured-post.has-cover .preview-subtitle :global(p),
	.featured-post.has-cover .preview-summary :global(p) {
		color: rgba(255, 255, 255, 0.9);
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
	}

	.featured-post.has-cover .preview-meta {
		color: rgba(255, 255, 255, 0.8);
	}

	.featured-post.has-cover .preview-category {
		background: rgba(255, 255, 255, 0.2);
		color: white;
	}

	.featured-post.has-cover .read-more {
		border-color: rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.1);
		color: white;
	}

	.featured-post.has-cover .read-more:hover {
		border-color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.2);
	}

	.featured-separator {
		margin-top: var(--blog-spacing-xl);
		margin-bottom: var(--blog-spacing-xl);
		border: none;
		background-color: var(--blog-border-light);
		height: 1px;
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

	.featured-post .preview-content h2 {
		font-size: var(--blog-heading-large);
	}

	.preview-subtitle {
		margin-bottom: var(--blog-spacing-sm);
	}

	.preview-summary {
		margin-bottom: var(--blog-spacing-md);
	}

	.preview-subtitle :global(p),
	.preview-summary :global(p) {
		margin: 0;
		color: var(--blog-text-light);
		font-style: italic;
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

		.featured-post {
			padding: var(--blog-spacing-lg);
		}

		.featured-post .preview-content h2 {
			font-size: var(--blog-heading-medium);
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

	.preview-subtitle :global(code),
	.preview-summary :global(code) {
		margin: 0;
		border-radius: var(--blog-border-radius-sm);
		background-color: var(--blog-inline-code-bg-light);
		padding: 0.2em 0.4em;
		font-size: 85%;
		font-family: var(--font-mono);
	}

	.featured-post.has-cover .preview-subtitle :global(a),
	.featured-post.has-cover .preview-summary :global(a) {
		color: #a7c7e7;
		text-decoration: underline;
	}

	.featured-post.has-cover .preview-subtitle :global(strong),
	.featured-post.has-cover .preview-summary :global(strong) {
		color: white;
	}

	.featured-post.has-cover .preview-subtitle :global(code),
	.featured-post.has-cover .preview-summary :global(code) {
		background: rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.9);
	}

	/* Add style for featured post *without* cover */
	.featured-post:not(.has-cover) {
		border-color: var(--blog-border-light); /* Ensure border is visible */
		background-color: var(--blog-callout-light); /* Use a subtle distinct background */
	}
</style>
