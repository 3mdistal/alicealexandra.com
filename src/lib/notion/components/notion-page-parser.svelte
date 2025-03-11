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
