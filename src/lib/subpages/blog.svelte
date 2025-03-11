<script lang="ts">
	import type { QueryDatabaseResponse } from '$lib/notion/types/notion-types';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
	import type {
		RichTextItemResponse,
		TextRichTextItemResponse
	} from '@notionhq/client/build/src/api-endpoints';

	export let accent: string;
	export let data: { post: QueryDatabaseResponse };

	let {
		post: { results }
	} = data;

	let loadingTitle = '';
	let hoveredPost: string | null = null;

	onMount(async () => {
		// Set accent color based on URL
		$page.url.searchParams.forEach((value, key) => {
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

	function isTextRichTextItem(item: RichTextItemResponse): item is TextRichTextItemResponse {
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

<div class="posts-container">
	<h1 class="posts-title" style="color: {accent}">Latest Posts</h1>

	<div class="posts-grid">
		{#each results as page, i}
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

				<div
					class="post-card"
					on:mouseenter={() => (hoveredPost = titleText)}
					on:mouseleave={() => (hoveredPost = null)}
					in:fly={{ y: 20, delay: i * 100, duration: 400 }}
				>
					<div class="post-content">
						<div class="post-meta">
							<span class="post-category" style="background-color: {accent}20; color: {accent}">
								{category || 'Uncategorized'}
							</span>
							<span class="post-date">{date}</span>
						</div>

						<h2 class="post-title">
							<a
								on:mousedown={() => {
									loadingTitle = titleText;
								}}
								href="/blog/{slug}"
								class="post-title-link"
								class:hovered={hoveredPost === titleText}
							>
								{titleText}
							</a>
						</h2>

						{#if subtitle}
							<p class="post-subtitle">{subtitle}</p>
						{/if}

						<div class="post-footer">
							<a href="/blog/{slug}" class="read-more">
								Read article
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<line x1="5" y1="12" x2="19" y2="12"></line>
									<polyline points="12 5 19 12 12 19"></polyline>
								</svg>
							</a>
						</div>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.posts-container {
		width: 100%;
	}

	.posts-title {
		margin-bottom: 1.5em;
		font-weight: 600;
		font-size: 2.5rem;
		text-align: center;
	}

	.posts-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	.post-card {
		position: relative;
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.05);
		overflow: hidden;
	}

	.post-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
		background: rgba(255, 255, 255, 0.08);
	}

	.post-content {
		padding: 1.5rem;
	}

	.post-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.post-category {
		display: inline-block;
		border-radius: 20px;
		padding: 0.25rem 0.75rem;
		font-weight: 500;
		font-size: 0.75rem;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.post-date {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.875rem;
	}

	.post-title {
		margin: 0 0 0.75rem;
		font-weight: 600;
		font-size: 1.5rem;
		line-height: 1.3;
		font-family: 'Spectral', serif;
	}

	.post-title-link {
		transition: color 0.2s ease;
		transition: background-size 0.3s ease;
		background-image: linear-gradient(transparent calc(100% - 2px), rgba(255, 255, 255, 0.3) 2px);
		background-size: 0% 100%;
		background-repeat: no-repeat;
		color: white;
		text-decoration: none;
	}

	.post-title-link:hover,
	.post-title-link.hovered {
		background-size: 100% 100%;
	}

	.post-subtitle {
		margin-bottom: 1.5rem;
		color: rgba(255, 255, 255, 0.7);
		font-style: italic;
		font-size: 1rem;
		line-height: 1.5;
		text-wrap: balance;
	}

	.post-footer {
		display: flex;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}

	.read-more {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: color 0.2s ease;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 500;
		font-size: 0.875rem;
		text-decoration: none;
	}

	.read-more:hover {
		color: white;
	}

	.read-more svg {
		transition: transform 0.2s ease;
	}

	.read-more:hover svg {
		transform: translateX(3px);
	}

	@media (min-width: 640px) {
		.posts-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.posts-title {
			font-size: 3rem;
			text-align: left;
		}

		.posts-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.post-title {
			font-size: 1.75rem;
		}
	}
</style>
