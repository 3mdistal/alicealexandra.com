<script lang="ts">
	import NotionPageParser from '$lib/notion/components/notion-page-parser.svelte';
	import TextMacro from '$lib/notion/components/text-macro.svelte';
	import BlogHeader from '$lib/components/blog-header.svelte';
	import DarkCodeTheme from 'svelte-highlight/styles/nord';
	import LightCodeTheme from 'svelte-highlight/styles/github';
	import { onMount, tick } from 'svelte';
	import { subAndSuper, wrapLists, createTOC } from '$lib/notion/utils/blog-helpers';
	import type {
		PageObjectResponse,
		RichTextPropertyItemObjectResponse,
		UrlPropertyItemObjectResponse,
		SelectPropertyItemObjectResponse,
                FormulaPropertyItemObjectResponse,
                FilesPropertyItemObjectResponse,
                QueryDatabaseResponse
        } from '$lib/notion/types/notion-types';

	let darkMode: boolean;
	let context: HTMLElement;

	const runBlogHelpers = async () => {
		await tick();
		subAndSuper(context);
		wrapLists(context);
		createTOC();
	};

	export let data: {
		post: {
			queryResponse: QueryDatabaseResponse | null;
			contentResponse: any | null;
		};
	};

	const { queryResponse, contentResponse } = data.post || {};

	const blogPost = queryResponse?.results?.[0] as PageObjectResponse | undefined;

	const pageCover = blogPost?.cover;

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

        function isFilesProperty(prop: any): prop is FilesPropertyItemObjectResponse {
                return prop?.type === 'files';
        }

        function isDateProperty(prop: any): prop is any {
                return prop?.type === 'date';
        }

	const {
		Name: title,
		Subtitle: subtitle,
		Summary: summary,
		OGDescription: ogDescription,
		ReadTime: readingTime,
		Category: category,
		'Publication Date': publicationDate,
		Slug: slug
	} = blogPost?.properties || {};

	// Extract data for the header
	const categoryName = getCategory(category);
	const publishedDate = formatDate(publicationDate);
	const readTime = formatReadingTime(readingTime);

	// Helper function to safely get text content
	function getTextContent(prop: any) {
		if (prop?.type === 'title') {
			return prop.title?.[0]?.plain_text || '';
		}
		return prop?.rich_text?.[0]?.plain_text || '';
	}

	// Helper function to format reading time
	function formatReadingTime(prop: any) {
		if (isFormulaProperty(prop) && prop.formula.type === 'string') {
			const time = prop.formula.string;
			return time === '1 minutes' ? '1 minute' : time;
		}
		return '5 min read';
	}

	// Helper function to format date
	function formatDate(prop: any) {
		if (isFormulaProperty(prop) && prop.formula.type === 'string') {
			return prop.formula.string;
		}
		if (isDateProperty(prop) && prop.date?.start) {
			const date = new Date(prop.date.start);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		}
		return '';
	}

	// Helper function to get category
	function getCategory(prop: any) {
		if (isSelectProperty(prop)) {
			return prop.select?.name || 'Article';
		}
		return 'Article';
	}

	// Helper function to get URL from URL property
        function getUrl(prop: any) {
                // Handle page cover object
                if (prop && (prop.type === 'external' || prop.type === 'file')) {
                        if (prop.type === 'external' && prop.external?.url) {
                                return prop.external.url;
                        }
                        if (prop.type === 'file' && prop.file?.url) {
                                return prop.file.url;
                        }
                }

                // Handle regular properties if not a page cover
                if (isUrlProperty(prop)) {
                        return prop.url;
                }
                if (isFilesProperty(prop)) {
                        const first = prop.files?.[0];
                        if (first?.type === 'file') {
                                return first.file.url;
                        }
                        if (first?.type === 'external') {
                                return first.external.url;
                        }
                }
                if (isFormulaProperty(prop) && prop.formula.type === 'string') {
                        return prop.formula.string;
                }
                return '';
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
                content={getUrl(pageCover) || 'https://unsplash.it/1200/600'}
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
                content={getUrl(pageCover) || 'https://unsplash.it/1200/600'}
        />
	<meta
		name="twitter:image:alt"
		content="Open graph representation of this blog article, {getTextContent(title) || 'Blog'}."
	/>

	{@html LightCodeTheme}
</svelte:head>

<div class="page-wrapper">
	{#if blogPost}
		<BlogHeader
			{blogPost}
			category={categoryName}
			publishedDate={publishedDate}
			readTime={readTime}
		/>
	{/if}

	<div class="blog-container">
	{#if content.length > 0}
		<div class="notion-container" bind:this={context}>
			<NotionPageParser results={content} />
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
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: var(--blog-bg) !important;
		min-height: 100vh;
	}

	.page-wrapper {
		min-height: 100vh;
		background-color: var(--blog-bg);
		position: relative;
		z-index: 1;
	}

	.blog-container {
		background-color: var(--blog-bg);
		padding: var(--blog-spacing-lg) var(--blog-spacing-sm);
		color: var(--blog-text);
		max-width: 900px;
		margin: 0 auto;

		@media (min-width: 640px) {
			padding: var(--blog-spacing-lg) var(--blog-spacing-md);
		}

		@media (min-width: 768px) {
			padding: var(--blog-spacing-lg) var(--blog-spacing-xl);
		}

		@media (min-width: 1280px) {
			padding: var(--blog-spacing-xl) var(--blog-spacing-xl);
		}

		@media (min-width: 1536px) {
			padding: var(--blog-spacing-xl) var(--blog-spacing-lg);
		}

		@media (min-width: 1920px) {
			padding: var(--blog-spacing-xl) 25vw;
		}



		:global(sub),
		:global(sup) {
			color: inherit;
		}
	}

	/* Styles for constraining top sections and back-link */
	.blog-container > div:not(.notion-container) {
		width: 100%;
		max-width: 900px;
		margin: 0 auto;
		font-size: var(--blog-body);

		@media (min-width: 1024px) {
			font-size: var(--blog-body-large);
		}
	}



	.notion-container {
		max-width: 900px;
		margin: 0 auto;
		font-size: var(--blog-body);
		line-height: 1.75rem;

		@media (min-width: 1024px) {
			font-size: var(--blog-body-large);
			line-height: 2rem;
		}

		:global(p) {
			margin-bottom: 1em;
		}
	}

	.back-link {
		width: 100%;
		max-width: var(--blog-content-width);
		margin-top: 4em;
		font-size: 2.25rem;
		line-height: 2.5rem;
		text-align: right;

		@media (min-width: 768px) {
			font-size: var(--blog-heading-large);
			line-height: 1;
		}

		a {
			display: inline-block;
			padding: var(--blog-spacing-md);
			color: var(--blog-text);
			font-family: 'Spectral', serif;
		}
	}

	/* Styles from blog-post.css */
	.blog-container {
		:global(.notion-container .toc) {
			margin-top: 2em;
			margin-bottom: 2em;
		}

		:global(.notion-container a) {
			color: var(--blog-link);
			font-weight: 500;

			&:hover {
				text-decoration: underline;
			}
		}

		:global(.notion-container code) {
			border-radius: var(--blog-border-radius-sm);
			background-color: var(--blog-code-bg);
			padding: 0.2em 0.4em;
			color: var(--blog-link);
		}

		:global(.notion-container pre code) {
			display: block;
			border-radius: var(--blog-border-radius);
			padding: 1em;
			overflow-x: auto;
		}

		:global(.notion-container pre) {
			margin-bottom: var(--blog-spacing-md);
		}

		:global(.notion-container blockquote) {
			margin-top: var(--blog-spacing-lg);
			margin-left: 2em;
			max-width: var(--blog-blockquote-width);
			color: var(--blog-callout);
			font-style: italic;
		}

		:global(.notion-container .image) {
			margin-top: 2em;
			margin-bottom: 2em;
			padding-right: var(--blog-spacing-xs);

			@media (min-width: 640px) {
				padding-right: 3em;
				padding-left: 1em;
			}

			& img {
				border-radius: 1.5rem;
				width: 100%;
				height: 100%;
				object-fit: contain;

				@media (min-width: 1024px) {
					object-position: left;
				}
			}
		}

		:global(.notion-container h2) {
			margin-top: 2.5em;
			margin-bottom: 1.5em;
			color: var(--blog-heading);
			font-weight: 500;
			font-size: var(--blog-heading-small);

			@media (min-width: 768px) {
				font-size: var(--blog-heading-medium);
			}

			@media (min-width: 1024px) {
				font-size: 2.25rem;
			}
		}

		:global(.notion-container h3) {
			margin-top: 1.5em;
			margin-bottom: 1em;
			color: var(--blog-heading);
			font-weight: 500;
			font-size: var(--blog-heading-small);

			@media (min-width: 768px) {
				font-size: var(--blog-heading-medium);
			}
		}

		:global(.notion-container ol),
		:global(.notion-container ul) {
			margin-left: 2em;

			li {
				color: inherit;
			}

			@media (prefers-color-scheme: dark) {
				color: var(--blog-text-dark);
			}
		}

		:global(.notion-container hr) {
			opacity: 0.8;
			margin: var(--blog-spacing-xl) auto;
			border: none;
			border-top: 1px solid var(--blog-border-light);
			width: auto;
			max-width: var(--blog-content-width);
			height: 1px;

			@media (prefers-color-scheme: dark) {
				border-top-color: var(--blog-border-dark);
			}
		}

		:global(ol) {
			list-style-type: decimal;
		}

		:global(ul) {
			list-style-type: disc;
		}

		:global(div.callout) {
			display: flex;
			align-items: flex-start;
			gap: 1rem;
			margin-top: var(--blog-spacing-lg);
			margin-bottom: var(--blog-spacing-md);
			border-radius: 0.5rem;
			background-color: var(--blog-callout-light);
			padding: var(--blog-spacing-lg) var(--blog-spacing-sm) var(--blog-spacing-md);

			@media (min-width: 768px) {
				gap: var(--blog-spacing-lg);
				padding-right: 5rem;
				padding-left: 5rem;
			}

			& > :first-child {
				font-size: var(--blog-heading-small);

				@media (min-width: 768px) {
					font-size: var(--blog-heading-medium);
				}
			}

			& > :last-child {
				font-size: var(--blog-body-small);

				@media (min-width: 768px) {
					font-size: var(--blog-body);
				}
			}

			@media (prefers-color-scheme: dark) {
				background-color: var(--blog-callout-dark);
			}
		}

		:global(.notion-container p, li) {
			color: var(--blog-accent-light);

			@media (prefers-color-scheme: dark) {
				color: var(--blog-accent-dark);
			}
		}
	}

	.blog-container {
		:global(.notion-container code) {
			font-family: 'Cutive Mono', 'Courier New', Courier, monospace;
		}

		:global(.notion-container pre code *) {
			font-family: 'Cutive Mono', 'Courier New', Courier, monospace;
		}
	}
</style>
