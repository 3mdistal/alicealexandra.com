<script lang="ts">
	import type { PageObjectResponse } from '$lib/notion/types/notion-types';

	export let blogPost: PageObjectResponse;
	export let category: string = '';
	export let publishedDate: string = '';
	export let readTime: string = '';

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

	// Mock author data - you can replace this with actual author data from your Notion setup
	const authors = [
		{
			name: 'Alice Alexandra Moore',
			role: 'Writer & Developer',
			avatar: '/images/alice-avatar.jpg' // Add your avatar image to static/images/
		}
	];
</script>

<div class="blog-header">
	<section class="header-grid">
		<!-- Breadcrumb Section -->
		<div class="breadcrumb-section">
			<div class="breadcrumb-container">
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
			</div>
		</div>

		<!-- Title Section -->
		<div class="title-section">
			<div class="title-container">
				<h1 class="blog-title">{title}</h1>
			</div>
		</div>

		<!-- Authors Section -->
		<div class="authors-section">
			<div class="authors-container">
				<div class="authors-list">
					{#each authors as author}
						<div class="author-info">
							<div class="author-avatar">
								<img src={author.avatar} alt={author.name} />
							</div>
							<div class="author-details">
								<div class="author-name">{author.name}</div>
								<div class="author-role">{author.role}</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Grid decorative lines -->
		<div class="grid-decoration" aria-hidden="true">
			<!-- Vertical lines -->
			<div class="vertical-line line-1"></div>
			<div class="vertical-line line-2"></div>
			
			<!-- Horizontal line -->
			<div class="horizontal-line"></div>
			
			<!-- Corner decorations -->
			<div class="corner-decoration top-left"></div>
			<div class="corner-decoration top-right"></div>
		</div>
	</section>

	<!-- Article metadata -->
	<div class="article-metadata">
		<div class="metadata-container">
			<div class="metadata-left">
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
			</div>
			<div class="metadata-right">
				<time class="publish-date" datetime={publishedDate}>
					{publishedDate}
				</time>
			</div>
		</div>

		{#if subtitle}
			<div class="subtitle-container">
				<p class="article-subtitle">{subtitle}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.blog-header {
		display: flex;
		flex-direction: column;
		max-width: 1080px;
		min-width: 368px;
		position: relative;
		background-color: rgb(250, 250, 250);
		margin: 0 auto;
	}

	.header-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		position: relative;
		width: 100%;
	}

	/* Breadcrumb Section */
	.breadcrumb-section {
		grid-column: 1 / -1;
		grid-row: 1;
		padding: 64px 0 32px;
		overflow: hidden;
		position: relative;
		z-index: 2;
	}

	.breadcrumb-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 0;
	}

	.breadcrumb {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: rgb(102, 102, 102);
		font-size: 14px;
		line-height: 20px;
		white-space: nowrap;
	}

	.breadcrumb-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: rgb(102, 102, 102);
		text-decoration: none;
		cursor: pointer;
	}

	.breadcrumb-link:hover {
		text-decoration: underline;
	}

	.back-icon {
		width: 16px;
		height: 16px;
		min-width: 16px;
		color: rgb(102, 102, 102);
	}

	.breadcrumb-separator {
		color: rgb(102, 102, 102);
	}

	.breadcrumb-category {
		font-weight: 500;
		color: rgb(102, 102, 102);
	}

	/* Title Section */
	.title-section {
		grid-column: 1 / -1;
		grid-row: 2;
		padding: 0 90px 32px;
		overflow: hidden;
		position: relative;
		z-index: 2;
	}

	.title-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 0;
	}

	.blog-title {
		font-size: 56px;
		font-weight: 600;
		letter-spacing: -3.36px;
		line-height: 1;
		text-align: center;
		text-wrap: balance;
		color: rgb(23, 23, 23);
		margin: 0;
	}

	/* Authors Section */
	.authors-section {
		grid-column: 1 / -1;
		grid-row: 3;
		position: relative;
		z-index: 2;
	}

	.authors-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 0;
	}

	.authors-list {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: flex-start;
		gap: 8px;
	}

	.author-info {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 20px;
		width: 100%;
		overflow: hidden;
		cursor: pointer;
	}

	.author-avatar {
		border-radius: 100%;
		border: 1px solid rgb(255, 255, 255);
		width: 20px;
		height: 20px;
		flex-shrink: 0;
		position: relative;
		overflow: hidden;
		transition: border 0.2s ease, background 0.2s ease;
	}

	.author-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: inherit;
	}

	.author-details {
		display: flex;
		align-items: stretch;
		justify-content: flex-start;
		gap: 8px;
		overflow: hidden;
		width: fit-content;
	}

	.author-name {
		font-size: 14px;
		font-weight: 500;
		line-height: 20px;
		white-space: nowrap;
		color: rgb(23, 23, 23);
	}

	.author-role {
		color: rgb(102, 102, 102);
		font-size: 14px;
		line-height: 20px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		width: fit-content;
	}

	/* Grid Decorations */
	.grid-decoration {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 1;
	}

	.vertical-line {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		background: linear-gradient(to bottom, 
			rgb(235, 235, 235) 0%, 
			rgb(235, 235, 235) 50%, 
			transparent 50%, 
			transparent 100%);
		background-size: 1px 8px;
	}

	.line-1 {
		left: 33.333%;
	}

	.line-2 {
		left: 66.666%;
	}

	.horizontal-line {
		position: absolute;
		left: 0;
		right: 0;
		height: 1px;
		top: 50%;
		background: linear-gradient(to right, 
			rgb(235, 235, 235) 0%, 
			rgb(235, 235, 235) 50%, 
			transparent 50%, 
			transparent 100%);
		background-size: 8px 1px;
	}

	.corner-decoration {
		position: absolute;
		width: 11px;
		height: 21px;
		border-style: solid;
		border-color: rgb(168, 168, 168);
		border-width: 0;
	}

	.top-left {
		top: -11px;
		left: 0;
		border-right-width: 1px;
		border-bottom-width: 1px;
	}

	.top-right {
		top: -11px;
		right: 0;
		border-left-width: 1px;
		border-bottom-width: 1px;
	}

	/* Article Metadata */
	.article-metadata {
		background-color: rgb(250, 250, 250);
		border-top: 1px solid rgb(235, 235, 235);
		padding: 24px;
	}

	.metadata-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 720px;
		margin: 0 auto;
		flex-wrap: wrap;
		gap: 16px;
	}

	.metadata-left {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 6px;
	}

	.reading-time {
		display: flex;
		align-items: center;
		gap: 6px;
		color: rgb(102, 102, 102);
		font-size: 14px;
		line-height: 20px;
	}

	.clock-icon {
		width: 16px;
		height: 16px;
		min-width: 16px;
		color: rgb(102, 102, 102);
	}

	.metadata-right {
		display: flex;
		align-items: center;
		flex-grow: 1;
		justify-content: flex-start;
		gap: 8px;
	}

	.publish-date {
		color: rgb(102, 102, 102);
		font-size: 14px;
		line-height: 20px;
		order: 3;
	}

	.subtitle-container {
		max-width: 720px;
		margin: 24px auto 0;
	}

	.article-subtitle {
		color: rgb(102, 102, 102);
		font-size: 24px;
		font-weight: 500;
		letter-spacing: -0.96px;
		line-height: 36px;
		margin: 0;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.blog-title {
			font-size: 32px;
			letter-spacing: -1.6px;
		}

		.title-section {
			padding: 0 24px 32px;
		}

		.article-subtitle {
			font-size: 18px;
			letter-spacing: -0.54px;
			line-height: 27px;
		}

		.metadata-container {
			flex-direction: column;
			align-items: flex-start;
		}

		.metadata-right {
			order: -1;
		}
	}

	@media (max-width: 480px) {
		.blog-title {
			font-size: 28px;
			letter-spacing: -1.4px;
		}

		.breadcrumb-section {
			padding: 32px 0 16px;
		}
	}
</style>
