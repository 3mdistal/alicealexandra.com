<script lang="ts">
	import type { QueryDatabaseResponse } from '$lib/notion/types/notion-types';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { PageObjectResponse } from '$lib/notion/types/notion-types';
	import type {
		RichTextItemResponse,
		TextRichTextItemResponse
	} from '$lib/notion/types/notion-types';

	export let accent: string;
	export let data: { post: QueryDatabaseResponse };

	let { post: { results = [] } = {} } = data;

	let loadingTitle = '';

	onMount(async () => {
		// Set accent color based on URL
		page.url.searchParams.forEach((value, key) => {
			if (key === 'accent') {
				accent = value;
			}
		});
	});

	// Type guard for PageObjectResponse
	function isPageObjectResponse(page: any): page is PageObjectResponse {
		return page && typeof page === 'object' && page.properties !== undefined;
	}

	// Type guards for Notion properties
	function isUrlProperty(property: any): property is { url: string } {
		return property && typeof property.url === 'string';
	}

	function isRichTextProperty(property: any): property is { title: RichTextItemResponse[] } {
		return property && Array.isArray(property.title);
	}

	function isTextRichTextItem(item: any): item is TextRichTextItemResponse {
		return item && item.type === 'text' && typeof item.text === 'object';
	}

	function isSelectProperty(property: any): property is { select: { name: string } } {
		return property && property.select && typeof property.select.name === 'string';
	}

	function isFormulaProperty(property: any): property is { formula: { string: string } } {
		return property && property.formula && typeof property.formula.string === 'string';
	}

	function isRichTextProperty2(property: any): property is { rich_text: RichTextItemResponse[] } {
		return property && Array.isArray(property.rich_text);
	}
</script>

<h1 class="posts-title" style="color: {accent}">Posts</h1>
{#each results as page}
	{#if isPageObjectResponse(page)}
		{@const slug = isUrlProperty(page.properties.Slug) ? page.properties.Slug.url : ''}
		{@const titleItem =
			isRichTextProperty(page.properties.Name) && page.properties.Name.title[0]
				? page.properties.Name.title[0]
				: null}
		{@const titleText =
			titleItem && isTextRichTextItem(titleItem) ? titleItem.text.content : 'Untitled'}
		{@const subtitleProp = page.properties.Subtitle}
		{@const subtitle =
			isRichTextProperty2(subtitleProp) &&
			subtitleProp.rich_text[0] &&
			isTextRichTextItem(subtitleProp.rich_text[0])
				? subtitleProp.rich_text[0].text.content
				: ''}
		{@const category = isSelectProperty(page.properties.Category)
			? page.properties.Category.select.name
			: ''}
		{@const date = isFormulaProperty(page.properties.FormattedPublicationDate)
			? page.properties.FormattedPublicationDate.formula.string
			: ''}

		<div class="post-item">
			<p class="post-title-wrapper">
				<a
					on:mousedown={() => {
						loadingTitle = titleText;
					}}
					href="/blog/{slug}"
					class="post-title-link"
				>
					{titleText}
				</a>
			</p>
			{#if subtitle}
				<p class="post-subtitle">{subtitle}</p>
			{/if}
			<p class="post-date">{date}</p>
			<div class="post-category-wrapper">
				<p class="post-category">{category}</p>
			</div>
		</div>
	{/if}
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
		color: white;
		font-weight: 500;
		font-size: var(--blog-heading-medium);
		line-height: 1;
		font-family: 'Spectral', serif;

		@media (max-width: 768px) {
			font-size: 1.75rem;
		}

		&:hover {
			text-decoration: underline;
		}

		&:active {
			color: var(--blog-secondary-dark);
		}
	}

	.post-subtitle {
		grid-row-start: 2;
		grid-column: span 2;
		margin-bottom: 0.5em;
		max-width: var(--blog-subtitle-width);
		color: var(--blog-heading-dark);
		font-style: italic;
		font-size: var(--blog-body);
		line-height: 1;
		text-wrap: balance;
	}

	.post-date {
		grid-row-start: 3;
		color: var(--blog-heading-dark);

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
		color: var(--blog-heading-dark);

		@media (max-width: 768px) {
			display: none;
		}
	}
</style>
