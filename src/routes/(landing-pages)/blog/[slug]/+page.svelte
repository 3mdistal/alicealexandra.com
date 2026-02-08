<script lang="ts">
	import '$lib/styles/prose.css';
	import BlogHeader from '$lib/components/blog-header.svelte';
	import type { BlogPost } from '$lib/content/blog';
	import { onMount, tick } from 'svelte';
	import { Marked } from 'marked';
	import { markedHighlight } from 'marked-highlight';
	import hljs from 'highlight.js/lib/core';
	import typescript from 'highlight.js/lib/languages/typescript';
	import javascript from 'highlight.js/lib/languages/javascript';
	import plaintext from 'highlight.js/lib/languages/plaintext';

	// Register languages
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('plaintext', plaintext);
	import { subAndSuper, createTOC } from '$lib/notion/utils/blog-helpers';

	let context: HTMLElement;

	const runBlogHelpers = async () => {
		await tick();
		if (context) {
			subAndSuper(context);
			createTOC();
		}
	};

	export let data: { post: BlogPost };

	const { post } = data;

	// Configure marked with syntax highlighting
	const marked = new Marked(
		markedHighlight({
			emptyLangClass: 'hljs',
			langPrefix: 'hljs language-',
			highlight(code, lang) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			}
		})
	);

	// Convert markdown to HTML
	const htmlContent = marked.parse(post.content);

	// Format reading time (handle "1 minutes" -> "1 minute")
	const formattedReadTime = post.readTime === '1 minutes' ? '1 minute' : post.readTime;

	onMount(() => {
		runBlogHelpers();
	});
</script>

<svelte:head>
	<title>{post.title || 'Blog'}</title>
	<meta name="og:title" content={post.title || 'Blog'} />
	<meta name="description" content={post.ogDescription} />

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content="https://www.alicealexandra.com/blog/{post.slug}" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Blog - {post.title || 'Blog'}" />
	<meta property="og:description" content={post.ogDescription} />
	<meta property="og:image" content={post.coverImage || 'https://unsplash.it/1200/600'} />

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@tempoimmaterial" />
	<meta name="twitter:creator" content="@tempoimmaterial" />
	<meta name="twitter:domain" content="alicealexandra.com" />
	<meta name="twitter:url" content="https://www.alicealexandra.com/blog" />
	<meta name="twitter:title" content="Blog - {post.title || 'Blog'}" />
	<meta name="twitter:description" content={post.ogDescription} />
	<meta name="twitter:image" content={post.coverImage || 'https://unsplash.it/1200/600'} />
	<meta
		name="twitter:image:alt"
		content="Open graph representation of this blog article, {post.title || 'Blog'}."
	/>

	<!-- Highlight.js themes - auto-switch based on color scheme -->
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
		media="(prefers-color-scheme: light)"
	/>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
		media="(prefers-color-scheme: dark)"
	/>
</svelte:head>

<div class="page-wrapper">
	<BlogHeader
		title={post.title}
		subtitle={post.subtitle}
		category={post.category || 'Article'}
		publishedDate={post.formattedPublicationDate}
		readTime={formattedReadTime}
	/>

	<div class="blog-container">
		{#if htmlContent}
			<div class="prose" bind:this={context}>
				{@html htmlContent}
			</div>
		{:else}
			<p>No content available.</p>
		{/if}
		<p class="back-link">
			<a href="/blog" data-sveltekit-noscroll>back.</a>
		</p>
	</div>
</div>

<style>
	.page-wrapper {
		position: relative;
		z-index: 1;
		background-color: var(--color-bg);
		min-height: 100vh;
	}

	.blog-container {
		margin: 0 auto;
		background-color: var(--color-bg);
		padding: var(--content-space-lg) var(--content-space-sm);
		max-width: 900px;
		color: var(--color-text);

		@media (min-width: 640px) {
			padding: var(--content-space-lg) var(--content-space-md);
		}

		@media (min-width: 768px) {
			padding: var(--content-space-lg) var(--content-space-xl);
		}

		@media (min-width: 1280px) {
			padding: var(--content-space-xl) var(--content-space-xl);
		}

		@media (min-width: 1536px) {
			padding: var(--content-space-xl) var(--content-space-lg);
		}
	}

	/* Styles for constraining non-prose sections */
	.blog-container > div:not(.prose) {
		margin: 0 auto;
		width: 100%;
		max-width: 900px;
		font-size: var(--content-font-size-body);

		@media (min-width: 1024px) {
			font-size: var(--content-font-size-body-lg);
		}
	}

	.back-link {
		margin-top: 4em;
		width: 100%;
		max-width: var(--content-measure);
		font-size: 2.25rem;
		line-height: 2.5rem;
		text-align: right;

		@media (min-width: 768px) {
			font-size: var(--content-font-size-heading-lg);
			line-height: 1;
		}

		a {
			display: inline-block;
			padding: var(--content-space-md);
			color: var(--color-text);
			font-family: var(--font-serif);
		}
	}
</style>
