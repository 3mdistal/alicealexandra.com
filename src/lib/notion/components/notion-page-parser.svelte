<script lang="ts">
	import TextMacro from '$lib/notion/components/text-macro.svelte';
	import { Highlight, HighlightSvelte } from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import NotionImage from '$lib/notion/components/notion-image.svelte';
	import type { BlockObjectResponse } from '$lib/notion/types/notion-types';

	export let results: Array<BlockObjectResponse>;

	function isBlockType<T extends BlockObjectResponse['type']>(
		block: BlockObjectResponse,
		type: T
	): block is Extract<BlockObjectResponse, { type: T }> {
		return block.type === type;
	}
</script>

{#each results as result (result.id)}
	{#if isBlockType(result, 'paragraph')}
		{#if result.paragraph.rich_text.length > 0}
			<p>
				<TextMacro type={result.paragraph} />
			</p>
		{:else}
			<br />
		{/if}
	{:else if isBlockType(result, 'heading_2')}
		<h2>
			<TextMacro type={result.heading_2} />
		</h2>
	{:else if isBlockType(result, 'heading_3')}
		<h3>
			<TextMacro type={result.heading_3} />
		</h3>
	{:else if isBlockType(result, 'numbered_list_item')}
		<li class="ordered">
			<TextMacro type={result.numbered_list_item} />
		</li>
	{:else if isBlockType(result, 'bulleted_list_item')}
		<li>
			<TextMacro type={result.bulleted_list_item} />
		</li>
	{:else if isBlockType(result, 'callout')}
		<div class="callout">
			{#if result.callout.icon?.type === 'emoji'}
				<p>{result.callout.icon.emoji}</p>
			{:else if result.callout.icon?.type === 'external'}
				<div><img src={result.callout.icon.external.url} alt="" /></div>
			{:else if result.callout.icon?.type === 'file'}
				<div>
					<NotionImage id={result.id} alt="" callout />
				</div>
			{/if}
			<p class="whitespace-pre-line">
				<TextMacro type={result.callout} />
			</p>
		</div>
	{:else if isBlockType(result, 'quote')}
		<blockquote class="whitespace-pre-line">
			<TextMacro type={result.quote} />
		</blockquote>
	{:else if isBlockType(result, 'image')}
		<div class="image relative">
			{#if result.image.type === 'external'}
				<img src={result.image.external.url} alt={result.image.caption[0]?.plain_text} />
			{:else if result.image.type === 'file'}
				<NotionImage id={result.id} alt={result.image.caption[0]?.plain_text ?? ''} />
			{/if}
		</div>
	{:else if isBlockType(result, 'code')}
		<div class="code-block">
			{#if result.code.language === 'typescript'}
				<Highlight language={typescript} code={result.code.rich_text[0]?.plain_text ?? ''} />
			{:else if result.code.language === 'php'}
				<HighlightSvelte code={result.code.rich_text[0]?.plain_text ?? ''} />
			{:else if result.code.language === 'html'}
				{@html result.code.rich_text[0]?.plain_text ?? ''}
			{/if}
		</div>
	{:else if isBlockType(result, 'divider')}
		<div class="divider">
			<hr />
		</div>
	{/if}
{/each}
