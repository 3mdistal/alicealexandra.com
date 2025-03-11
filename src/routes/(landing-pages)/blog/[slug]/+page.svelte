<script lang="ts">
	import NotionPageParser from '$lib/notion/components/notion-page-parser.svelte';
	import TextMacro from '$lib/notion/components/text-macro.svelte';
	import DarkCodeTheme from 'svelte-highlight/styles/nord';
	import LightCodeTheme from 'svelte-highlight/styles/github';
	import { onMount, tick } from 'svelte';
	import { subAndSuper, wrapLists, createTOC, insertTOC } from '$lib/notion/utils/blog-helpers';
	import { fade, fly } from 'svelte/transition';
	import type {
		PageObjectResponse,
		RichTextPropertyItemObjectResponse,
		UrlPropertyItemObjectResponse,
		SelectPropertyItemObjectResponse,
		FormulaPropertyItemObjectResponse,
		QueryDatabaseResponse
	} from '$lib/notion/types/notion-types';

	const { data } = $props<{
		data: {
			post: {
				queryResponse: QueryDatabaseResponse | null;
				contentResponse: any | null;
			};
		};
	}>();

	let context: HTMLElement;
	let tocVisible = false;
	let codeTheme = LightCodeTheme; // Default to light theme

	$effect(() => {
		if (typeof window !== 'undefined') {
			const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
				codeTheme = e.matches ? DarkCodeTheme : LightCodeTheme;
			};

			// Set initial theme
			updateTheme(darkModeMediaQuery);

			// Listen for changes
			darkModeMediaQuery.addEventListener('change', updateTheme);

			return () => {
				darkModeMediaQuery.removeEventListener('change', updateTheme);
			};
		}
	});

	const runBlogHelpers = async () => {
		await tick();
		subAndSuper(context);
		wrapLists(context);

		// Explicitly call insertTOC and set tocVisible flag
		insertTOC();
		tocVisible = document.querySelector('.toc-container') !== null;

		// If TOC wasn't created, try again after a short delay
		if (!tocVisible) {
			setTimeout(() => {
				insertTOC();
				tocVisible = document.querySelector('.toc-container') !== null;
			}, 500);
		}
	};

	const { queryResponse, contentResponse } = data.post || {};

	const blogPost = queryResponse?.results?.[0] as PageObjectResponse | undefined;

	const content = contentResponse?.results || [];

	// Type guards for Notion properties
	function isUrlProperty(prop: any): prop is UrlPropertyItemObjectResponse {
		return prop?.type === 'url';
	}

	function isSelectProperty(prop: any): prop is SelectPropertyItemObjectResponse {
		return prop?.type === 'select';
	}

	function isFormulaProperty(prop: any): prop is FormulaPropertyItemObjectResponse {
		return prop?.type === 'formula';
	}

	function isRichTextProperty(prop: any): prop is RichTextPropertyItemObjectResponse {
		return prop?.type === 'rich_text';
	}

	const {
		Name: title,
		Subtitle: subtitle,
		Summary: summary,
		OGDescription: ogDescription,
		ReadTime: readingTime,
		Category: category,
		Slug: slug,
		Preview: coverURL
	} = blogPost?.properties || {};

	// Helper function to safely get text content
	function getTextContent(prop: any) {
		if (prop?.type === 'title') {
			return prop.title?.[0]?.plain_text || '';
		}
		return prop?.rich_text?.[0]?.plain_text || '';
	}

	// Helper function to get URL from URL property
	function getUrl(prop: any) {
		return isUrlProperty(prop) ? prop.url : '';
	}

	onMount(() => {
		runBlogHelpers();
		fetch(window.location.href, {
			headers: {
				Accept: 'application/json',
				'x-prerender-revalidate': 'JKmtY3BJXXbqQNvcGTUCEkPrrScrd5fs'
			}
		});
	});
</script>

<svelte:head>
	<title>{getTextContent(title) || 'Blog'}</title>
	<meta name="og:title" content={getTextContent(title) || 'Blog'} />
	<meta name="description" content={getTextContent(ogDescription)} />

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content="https://www.alicealexandra.com/blog/{getUrl(slug)}" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Blog - {getTextContent(title) || 'Blog'}" />
	<meta property="og:description" content={getTextContent(ogDescription)} />
	<meta
		property="og:image"
		content={isUrlProperty(coverURL) ? coverURL.url : 'https://unsplash.it/1200/600'}
	/>

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@tempoimmaterial" />
	<meta name="twitter:creator" content="@tempoimmaterial" />
	<meta name="twitter:domain" content="alicealexandra.com" />
	<meta name="twitter:url" content="https://www.alicealexandra.com/blog" />
	<meta name="twitter:title" content="Blog - {getTextContent(title) || 'Blog'}" />
	<meta name="twitter:description" content={getTextContent(ogDescription)} />
	<meta
		name="twitter:image"
		content={isUrlProperty(coverURL) ? coverURL.url : 'https://unsplash.it/1200/600'}
	/>
	<meta
		name="twitter:image:alt"
		content="Open graph representation of this blog article, {getTextContent(title) || 'Blog'}."
	/>

	{@html codeTheme}
</svelte:head>

<article class="blog-post">
	<div class="blog-post-container">
		<div class="blog-post-header" in:fade={{ duration: 800, delay: 200 }}>
			<div class="header-top">
				<a href="/blog" class="back-link" in:fly={{ x: -20, duration: 600, delay: 100 }}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="19" y1="12" x2="5" y2="12"></line>
						<polyline points="12 19 5 12 12 5"></polyline>
					</svg>
					Back to posts
				</a>
			</div>

			<div class="title-container" in:fly={{ y: 20, duration: 800, delay: 300 }}>
				<h1>{getTextContent(title) || 'Untitled'}</h1>
				{#if isRichTextProperty(subtitle)}
					<p class="subtitle">
						<em><TextMacro type={subtitle} /></em>
					</p>
				{/if}
			</div>

			<div class="meta-container" in:fly={{ y: 20, duration: 800, delay: 400 }}>
				<div class="meta-item">
					<span class="meta-label">Category</span>
					<span class="meta-value category-tag">
						{isSelectProperty(category) ? category.select?.name : 'Uncategorized'}
					</span>
				</div>

				<div class="meta-item">
					<span class="meta-label">Reading Time</span>
					<span class="meta-value">
						{#if isFormulaProperty(readingTime) && readingTime.formula.type === 'string'}
							{readingTime.formula.string === '1 minutes' ? '1 minute' : readingTime.formula.string}
						{:else}
							Unknown
						{/if}
					</span>
				</div>

				{#if isRichTextProperty(summary)}
					<div class="meta-item summary">
						<span class="meta-label">Summary</span>
						<span class="meta-value summary-text">
							<TextMacro type={summary} />
						</span>
					</div>
				{/if}
			</div>
		</div>

		{#if isUrlProperty(coverURL) && coverURL.url}
			<div class="cover-image-container" in:fade={{ duration: 1000, delay: 500 }}>
				<img src={coverURL.url} alt={getTextContent(title)} class="cover-image" />
			</div>
		{/if}

		{#if content.length > 0}
			<div
				class="notion-content-container"
				in:fade={{ duration: 800, delay: 600 }}
				bind:this={context}
			>
				<NotionPageParser results={content} />
			</div>
		{/if}
	</div>
</article>

<style>
	.blog-post {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.blog-post-container {
		background-color: var(--blog-bg-light);
		min-height: 100vh;
	}

	@media (prefers-color-scheme: dark) {
		.blog-post-container {
			background-color: var(--blog-bg-dark);
		}
	}

	.blog-post-header {
		margin: 0 auto;
		padding: 2rem 2rem;
		width: 100%;
		max-width: var(--blog-content-width);
	}

	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition:
			transform 0.3s ease,
			color 0.3s ease;
		color: var(--blog-accent-light);
		font-size: 1rem;
	}

	.back-link:hover {
		transform: translateX(-5px);
		color: var(--blog-text-light);
		text-decoration: none;
	}

	.title-container {
		margin-bottom: 2rem;
	}

	h1 {
		margin-bottom: 1rem;
		color: var(--blog-heading-light);
		font-weight: 700;
		font-size: var(--blog-heading-large);
		line-height: 1.2;
	}

	.subtitle {
		max-width: var(--blog-subtitle-width);
		color: var(--blog-accent-light);
		font-size: var(--blog-body-large);
		line-height: 1.5;
	}

	.meta-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.meta-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.meta-label {
		color: var(--blog-secondary-light);
		font-size: 0.875rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.meta-value {
		color: var(--blog-accent-light);
		font-size: 1rem;
	}

	.category-tag {
		display: inline-block;
		border-radius: 2rem;
		background-color: rgba(255, 255, 255, 0.1);
		padding: 0.25rem 0.75rem;
		width: fit-content;
		font-size: 0.875rem;
	}

	.summary {
		margin-top: 0.5rem;
	}

	.summary-text {
		color: var(--blog-accent-light);
		font-size: var(--blog-body);
		line-height: 1.6;
	}

	.cover-image-container {
		margin: 0 auto 2rem;
		padding: 0 2rem;
		width: 100%;
		max-width: var(--blog-content-width);
	}

	.cover-image {
		border-radius: var(--blog-border-radius);
		aspect-ratio: 16/9;
		width: 100%;
		height: auto;
		object-fit: cover;
	}

	.notion-content-container {
		margin: 0 auto;
		padding: 0 2rem;
		width: 100%;
		max-width: var(--blog-content-width);
	}

	/* Custom TOC styles to ensure visibility */
	:global(.toc-container) {
		margin: 2rem 0 3rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.08);
		padding: 1.5rem;
	}

	:global(.toc-header) {
		margin-bottom: 1rem;
		color: var(--blog-heading-light);
		font-weight: 600;
		font-size: 1.25rem;
	}

	:global(.toc-list) {
		margin: 0;
		padding: 0;
		list-style-type: none;
	}

	:global(.toc-item) {
		transition: border-color 0.2s ease;
		margin-bottom: 0.75rem;
		border-left: 2px solid rgba(255, 255, 255, 0.2);
		padding-left: 1rem;
	}

	:global(.toc-item:hover) {
		border-left-color: rgba(255, 255, 255, 0.6);
	}

	:global(.toc-link) {
		display: inline-block;
		transition:
			color 0.2s ease,
			transform 0.2s ease;
		color: var(--blog-accent-light);
		font-size: 1rem;
		text-decoration: none;
	}

	:global(.toc-link:hover) {
		transform: translateX(3px);
		color: var(--blog-text-light);
		text-decoration: none;
	}

	:global(.highlight-heading) {
		animation: highlight-pulse 2s ease-out;
	}

	@keyframes highlight-pulse {
		0% {
			background-color: rgba(209, 220, 231, 0.2);
		}
		100% {
			background-color: transparent;
		}
	}

	@media (min-width: 768px) {
		.meta-container {
			flex-direction: row;
			flex-wrap: wrap;
			gap: 2rem;
		}

		.summary {
			flex-basis: 100%;
			margin-top: 1rem;
		}
	}
</style>
