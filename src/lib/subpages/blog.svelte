<script lang="ts">
	import type { QueryDataSourceResponse } from '$lib/notion/types/notion-types';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { PageObjectResponse } from '$lib/notion/types/notion-types';
	import type {
		RichTextItemResponse,
		TextRichTextItemResponse
	} from '$lib/notion/types/notion-types';

	export let accent: string;
	export let data: { post: QueryDataSourceResponse };

	let { post: { results = [] } = {} } = data;

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
		{@const slugProp = page.properties['Slug']}
		{@const slug = isUrlProperty(slugProp) ? slugProp.url : ''}
		{@const nameProp = page.properties['Name']}
		{@const titleItem =
			isRichTextProperty(nameProp) && nameProp.title[0]
				? nameProp.title[0]
				: null}
		{@const titleText =
			titleItem && isTextRichTextItem(titleItem) ? titleItem.text.content : 'Untitled'}
		{@const subtitleProp = page.properties['Subtitle']}
		{@const subtitle =
			isRichTextProperty2(subtitleProp) &&
			subtitleProp.rich_text[0] &&
			isTextRichTextItem(subtitleProp.rich_text[0])
				? subtitleProp.rich_text[0].text.content
				: ''}
		{@const categoryProp = page.properties['Category']}
		{@const category = isSelectProperty(categoryProp)
			? categoryProp.select.name
			: ''}
		{@const dateProp = page.properties['FormattedPublicationDate']}
		{@const date = isFormulaProperty(dateProp)
			? dateProp.formula.string
			: ''}

		<div class="post-item">
			<p class="post-title-wrapper">
				<a href="/blog/{slug}" class="post-title-link">
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
		transition: color 0.15s ease;
		color: white;
		font-weight: 500;
		font-size: var(--blog-heading-medium);
		line-height: 1;
		font-family: 'Spectral', serif;

		@media (max-width: 768px) {
			font-size: 1.75rem;
		}

		&:hover {
			color: var(--blog-heading-dark);
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
