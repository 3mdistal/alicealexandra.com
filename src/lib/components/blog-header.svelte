<script lang="ts">
	import type { PageObjectResponse } from '$lib/notion/types/notion-types';

	interface Props {
		blogPost: PageObjectResponse;
		category?: string;
		publishedDate?: string;
		readTime?: string;
	}

	const { blogPost, category = '', publishedDate = '', readTime = '' }: Props = $props();

	// Helper function to safely get text content from Notion properties
	function getTextContent(prop: any) {
		if (prop?.type === 'title') {
			return prop.title?.[0]?.plain_text || '';
		}
		return prop?.rich_text?.[0]?.plain_text || '';
	}

	// Get the blog post data
	const title = getTextContent(blogPost?.properties?.Name);
	const subtitle = getTextContent(blogPost?.properties?.Subtitle);
</script>

<div class="blog-header">
	<!-- Breadcrumb Navigation -->
	<nav class="breadcrumb">
		<a href="/blog" class="breadcrumb-link">
			<svg class="back-icon" viewBox="0 0 16 16" width="16" height="16">
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M6.46966 13.7803L6.99999 14.3107L8.06065 13.25L7.53032 12.7197L3.56065 8.75001H14.25H15V7.25001H14.25H3.56065L7.53032 3.28034L8.06065 2.75001L6.99999 1.68935L6.46966 2.21968L1.39644 7.2929C1.00592 7.68342 1.00592 8.31659 1.39644 8.70711L6.46966 13.7803Z"
					fill="currentColor"
				/>
			</svg>
			<span>Blog</span>
		</a>
		<span class="breadcrumb-separator">/</span>
		<span class="breadcrumb-category">{category || 'Article'}</span>
	</nav>

	<!-- Title -->
	<h1 class="blog-title">{title}</h1>

	{#if subtitle}
		<p class="blog-subtitle">{subtitle}</p>
	{/if}

	<!-- Article metadata -->
	<div class="article-metadata">
		<div class="reading-time">
			<svg class="clock-icon" viewBox="0 0 16 16" width="16" height="16">
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M5.35066 2.06247C5.96369 1.78847 6.62701 1.60666 7.32351 1.53473L7.16943 0.0426636C6.31208 0.1312 5.49436 0.355227 4.73858 0.693033L5.35066 2.06247ZM8.67651 1.53473C11.9481 1.87258 14.5 4.63876 14.5 8.00001C14.5 11.5899 11.5899 14.5 8.00001 14.5C4.63901 14.5 1.87298 11.9485 1.5348 8.67722L0.0427551 8.83147C0.459163 12.8594 3.86234 16 8.00001 16C12.4183 16 16 12.4183 16 8.00001C16 3.86204 12.8589 0.458666 8.83059 0.0426636L8.67651 1.53473ZM2.73972 4.18084C3.14144 3.62861 3.62803 3.14195 4.18021 2.74018L3.29768 1.52727C2.61875 2.02128 2.02064 2.61945 1.52671 3.29845L2.73972 4.18084ZM1.5348 7.32279C1.60678 6.62656 1.78856 5.96348 2.06247 5.35066L0.693033 4.73858C0.355343 5.4941 0.131354 6.31152 0.0427551 7.16854L1.5348 7.32279ZM8.75001 4.75V4H7.25001V4.75V7.875C7.25001 8.18976 7.3982 8.48615 7.65001 8.675L9.55001 10.1L10.15 10.55L11.05 9.35L10.45 8.9L8.75001 7.625V4.75Z"
					fill="currentColor"
				/>
			</svg>
			<span>{readTime || '5 min read'}</span>
		</div>

		{#if publishedDate}
			<time class="publish-date" datetime={publishedDate}>
				{publishedDate}
			</time>
		{/if}
	</div>
</div>

<style>
	.blog-header {
		width: 100%;
		max-width: 900px;
		margin: 0 auto;
		margin-top: 80px; /* More space from top */
		padding: var(--blog-spacing-lg) var(--blog-spacing-sm);
		color: var(--blog-text);

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
	}

	/* Breadcrumb */
	.breadcrumb {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-bottom: var(--blog-spacing-md);
		font-size: var(--blog-body-small);
		color: var(--blog-secondary);
	}

	.breadcrumb-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--blog-link);
		text-decoration: none;
		font-weight: 500;

		&:hover {
			color: var(--blog-link-hover);
			text-decoration: underline;
		}
	}

	.back-icon {
		width: 16px;
		height: 16px;
		min-width: 16px;
		color: currentColor;
	}

	.breadcrumb-link .back-icon path {
		fill: currentColor !important;
		color: inherit !important;
	}

	.breadcrumb-separator {
		color: var(--blog-secondary);
	}

	.breadcrumb-category {
		font-weight: 500;
		color: var(--blog-secondary);
	}

	/* Title */
	.blog-title {
		font-size: 2.25rem;
		line-height: 2.5rem;
		margin: 0 0 var(--blog-spacing-sm) 0;
		color: var(--blog-heading);
		font-weight: 500;
		font-family: 'Spectral', serif;

		@media (min-width: 640px) {
			font-size: 3rem;
			line-height: 1;
		}

		@media (min-width: 768px) {
			font-size: var(--blog-heading-large);
			line-height: 1;
		}

		@media (min-width: 1024px) {
			font-size: 4.5rem;
			line-height: 1;
		}
	}

	/* Subtitle */
	.blog-subtitle {
		max-width: var(--blog-subtitle-width);
		margin: 0 0 var(--blog-spacing-lg) 0;
		color: var(--blog-accent);
		font-style: italic;
		font-size: var(--blog-body);
		line-height: 1.75rem;
		text-wrap: balance;

		@media (min-width: 768px) {
			font-size: var(--blog-body-large);
			line-height: 2.25rem;
		}
	}

	/* Article Metadata */
	.article-metadata {
		display: flex;
		align-items: center;
		gap: var(--blog-spacing-md);
		margin-bottom: var(--blog-spacing-md);
		padding-bottom: var(--blog-spacing-md);
		border-bottom: 1px solid var(--blog-border);
		flex-wrap: wrap;
	}

	.reading-time {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--blog-secondary);
		font-size: var(--blog-body-small);
	}

	.clock-icon {
		width: 16px;
		height: 16px;
		min-width: 16px;
		color: currentColor;
	}

	.reading-time .clock-icon path {
		fill: currentColor !important;
		color: inherit !important;
	}

	.publish-date {
		color: var(--blog-secondary);
		font-size: var(--blog-body-small);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.blog-title {
			font-size: 1.875rem;
		}

		.article-metadata {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--blog-spacing-xs);
		}
	}
</style>
