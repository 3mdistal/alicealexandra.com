<script lang="ts">
	import TextMacro from '$lib/notion/components/text-macro.svelte';
	import { Highlight, HighlightSvelte } from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import NotionImage from '$lib/notion/components/notion-image.svelte';
	import { fade, fly } from 'svelte/transition';
	import type { BlockObjectResponse } from '$lib/notion/types/notion-types';

	export let results: Array<BlockObjectResponse>;

	function isBlockType<T extends BlockObjectResponse['type']>(
		block: BlockObjectResponse,
		type: T
	): block is Extract<BlockObjectResponse, { type: T }> {
		return block.type === type;
	}

	// Function to determine animation delay based on index
	function getAnimationDelay(index: number): number {
		return Math.min(index * 50, 1000); // Cap at 1000ms
	}
</script>

<div class="notion-content">
	{#each results as result, index (result.id)}
		{#if isBlockType(result, 'paragraph')}
			{#if result.paragraph.rich_text.length > 0}
				<p in:fly={{ y: 10, duration: 400, delay: getAnimationDelay(index) }}>
					<TextMacro type={result.paragraph} />
				</p>
			{:else}
				<div class="spacer" in:fade={{ duration: 200, delay: getAnimationDelay(index) }}></div>
			{/if}
		{:else if isBlockType(result, 'heading_2')}
			<h2 class="notion-heading" in:fly={{ y: 15, duration: 500, delay: getAnimationDelay(index) }}>
				<TextMacro type={result.heading_2} />
			</h2>
		{:else if isBlockType(result, 'heading_3')}
			<h3
				class="notion-subheading"
				in:fly={{ y: 12, duration: 450, delay: getAnimationDelay(index) }}
			>
				<TextMacro type={result.heading_3} />
			</h3>
		{:else if isBlockType(result, 'numbered_list_item')}
			<li
				class="notion-list-item ordered"
				in:fly={{ y: 10, duration: 400, delay: getAnimationDelay(index) }}
			>
				<TextMacro type={result.numbered_list_item} />
			</li>
		{:else if isBlockType(result, 'bulleted_list_item')}
			<li
				class="notion-list-item"
				in:fly={{ y: 10, duration: 400, delay: getAnimationDelay(index) }}
			>
				<TextMacro type={result.bulleted_list_item} />
			</li>
		{:else if isBlockType(result, 'callout')}
			<div
				class="notion-callout"
				in:fly={{ y: 20, duration: 500, delay: getAnimationDelay(index) }}
			>
				<div class="callout-icon">
					{#if result.callout.icon?.type === 'emoji'}
						<span class="emoji">{result.callout.icon.emoji}</span>
					{:else if result.callout.icon?.type === 'external'}
						<div class="icon-image"><img src={result.callout.icon.external.url} alt="" /></div>
					{:else if result.callout.icon?.type === 'file'}
						<div class="icon-image">
							<NotionImage id={result.id} alt="" callout />
						</div>
					{/if}
				</div>
				<div class="callout-content">
					<TextMacro type={result.callout} />
				</div>
			</div>
		{:else if isBlockType(result, 'quote')}
			<blockquote
				class="notion-quote"
				in:fly={{ y: 15, duration: 450, delay: getAnimationDelay(index) }}
			>
				<TextMacro type={result.quote} />
			</blockquote>
		{:else if isBlockType(result, 'image')}
			<figure class="notion-image" in:fade={{ duration: 800, delay: getAnimationDelay(index) }}>
				{#if result.image.type === 'external'}
					<img
						src={result.image.external.url}
						alt={result.image.caption[0]?.plain_text}
						loading="lazy"
					/>
				{:else if result.image.type === 'file'}
					<NotionImage id={result.id} alt={result.image.caption[0]?.plain_text ?? ''} />
				{/if}
				{#if result.image.caption.length > 0}
					<figcaption class="image-caption">
						{result.image.caption[0]?.plain_text}
					</figcaption>
				{/if}
			</figure>
		{:else if isBlockType(result, 'code')}
			<div class="notion-code" in:fly={{ y: 15, duration: 450, delay: getAnimationDelay(index) }}>
				<div class="code-header">
					<span class="code-language">{result.code.language}</span>
				</div>
				<div class="code-content">
					{#if result.code.language === 'typescript'}
						<Highlight language={typescript} code={result.code.rich_text[0]?.plain_text ?? ''} />
					{:else if result.code.language === 'php'}
						<HighlightSvelte code={result.code.rich_text[0]?.plain_text ?? ''} />
					{:else if result.code.language === 'html'}
						{@html result.code.rich_text[0]?.plain_text ?? ''}
					{/if}
				</div>
			</div>
		{:else if isBlockType(result, 'divider')}
			<div class="notion-divider" in:fade={{ duration: 400, delay: getAnimationDelay(index) }}>
				<hr />
			</div>
		{/if}
	{/each}
</div>

<style>
	.notion-content {
		width: 100%;
	}

	.spacer {
		height: 1rem;
	}

	.notion-heading {
		margin: 2.5rem 0 1.5rem;
		color: var(--blog-heading-light);
		font-weight: 600;
		font-size: 1.75rem;
		line-height: 1.3;
	}

	.notion-subheading {
		margin: 2rem 0 1rem;
		color: var(--blog-heading-light);
		font-weight: 600;
		font-size: 1.5rem;
		line-height: 1.3;
	}

	.notion-list-item {
		margin-bottom: 0.75rem;
		color: var(--blog-text-light);
		line-height: 1.6;
	}

	.notion-callout {
		display: flex;
		gap: 1rem;
		margin: 2rem 0;
		border-left: 4px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		background: var(--blog-callout-light);
		padding: 1.25rem;
		color: var(--blog-text-light);
	}

	.callout-icon {
		flex-shrink: 0;
		font-size: 1.5rem;
		line-height: 1;
	}

	.callout-content {
		flex-grow: 1;
		line-height: 1.6;
	}

	.emoji {
		font-size: 1.5rem;
	}

	.icon-image {
		width: 1.5rem;
		height: 1.5rem;
	}

	.icon-image img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.notion-quote {
		margin: 2rem 0;
		border-left: 4px solid rgba(255, 255, 255, 0.3);
		padding-left: 1.25rem;
		color: var(--blog-accent-light);
		font-style: italic;
		line-height: 1.6;
	}

	.notion-image {
		margin: 2.5rem 0;
		border-radius: 8px;
		overflow: hidden;
	}

	.notion-image img {
		transition: transform 0.3s ease;
		border-radius: 8px;
		width: 100%;
	}

	.notion-image:hover img {
		transform: scale(1.02);
	}

	.image-caption {
		margin-top: 0.75rem;
		color: var(--blog-secondary-light);
		font-style: italic;
		font-size: 0.875rem;
		text-align: center;
	}

	.notion-code {
		margin: 2rem 0;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		background: var(--blog-code-bg, rgba(0, 0, 0, 0.3));
		overflow: hidden;
	}

	.code-header {
		display: flex;
		align-items: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.2);
		padding: 0.5rem 1rem;
	}

	.code-language {
		color: var(--blog-secondary-light, rgba(255, 255, 255, 0.6));
		font-weight: 600;
		font-size: 0.75rem;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.code-content {
		padding: 1rem;
		overflow-x: auto;
	}

	.notion-divider {
		margin: 2.5rem 0;
	}

	.notion-divider hr {
		border: none;
		border-top: 1px solid var(--blog-border-light, rgba(255, 255, 255, 0.2));
	}

	/* Fix paragraph spacing */
	:global(.notion-content p) {
		margin-bottom: var(--blog-paragraph-spacing);
		max-width: 100%;
		color: var(--blog-text-light);
		line-height: 1.7;
	}

	/* Ensure proper text color in dark mode */
	:global(html.dark-mode .notion-content p),
	:global(html.dark-mode .notion-list-item),
	:global(html.dark-mode .callout-content) {
		color: var(--blog-text-dark);
	}

	:global(html.dark-mode .notion-heading),
	:global(html.dark-mode .notion-subheading) {
		color: var(--blog-heading-dark);
	}

	:global(html.dark-mode .notion-quote) {
		border-left-color: var(--blog-border-dark);
		color: var(--blog-accent-dark);
	}

	:global(html.dark-mode .notion-callout) {
		border-left-color: var(--blog-border-dark);
		background: var(--blog-callout-dark);
	}

	:global(html.dark-mode .image-caption) {
		color: var(--blog-secondary-dark);
	}

	:global(html.dark-mode .code-language) {
		color: var(--blog-secondary-dark);
	}

	:global(html.dark-mode .notion-divider hr) {
		border-color: var(--blog-border-dark);
	}

	@media (min-width: 768px) {
		.notion-heading {
			font-size: 2rem;
		}

		.notion-subheading {
			font-size: 1.625rem;
		}

		.notion-callout {
			padding: 1.5rem;
		}

		.notion-quote {
			margin: 2rem auto;
		}
	}
</style>
