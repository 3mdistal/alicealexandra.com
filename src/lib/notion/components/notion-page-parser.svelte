<script lang="ts">
	import TextMacro from './text-macro.svelte';
	import { Highlight, HighlightSvelte } from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import NotionImage from './notion-image.svelte';
	import Socials from '$lib/icons/socials.svelte';
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
			{:else if result.code.language === 'plain text'}
				{#if result.code.rich_text[0]?.plain_text?.includes('Socials')}
					{#if result.code.rich_text[0]?.plain_text?.includes('small')}
						<div class="w-20">
							<Socials />
						</div>
					{:else}
						<Socials />
					{/if}
				{:else}
					{@html result.code.rich_text[0]?.plain_text ?? ''}
				{/if}
			{/if}
		</div>
	{:else if isBlockType(result, 'divider')}
		<div class="divider">
			<hr />
		</div>
	{/if}
{/each}

<style>
	.callout {
		display: flex;
		margin: var(--blog-spacing-md) 0;
		border-radius: var(--blog-border-radius);
		background-color: var(--blog-callout-bg);
		padding: var(--blog-spacing-md);

		& p {
			margin: 0;
		}

		& div {
			margin-right: var(--blog-spacing-sm);
		}
	}

	.whitespace-pre-line {
		white-space: pre-line;
	}

	blockquote {
		margin: var(--blog-spacing-md) 0;
		border-left: 4px solid var(--blog-accent);
		background-color: var(--blog-quote-bg);
		padding: var(--blog-spacing-md);
		font-style: italic;
	}

	.image {
		margin: var(--blog-spacing-lg) 0;

		& img {
			border-radius: var(--blog-border-radius);
			max-width: 100%;
		}
	}

	.relative {
		position: relative;
	}

	.code-block {
		padding-bottom: var(--blog-spacing-md);

		& :global(.hljs) {
			border-radius: var(--blog-border-radius);
			background-color: var(--blog-code-bg);
		}

		& :global(code) {
			font-size: var(--blog-code);
			letter-spacing: -0.05em;
		}

		& :global(span.hljs-name) {
			color: var(--blog-code-tag);
		}

		& :global(span.hljs-params),
		& :global(span.hljs-property),
		& :global(span.language-css),
		& :global(span.language-javascript) {
			color: var(--blog-code-property);
		}

		& :global(span) {
			font-family: monospace;
		}
	}

	.divider {
		padding: 0 30%;
		padding-top: var(--blog-spacing-sm);
		padding-bottom: var(--blog-spacing-lg);

		@media (min-width: 768px) {
			padding: 0 35%;
			padding-top: var(--blog-spacing-sm);
			padding-bottom: var(--blog-spacing-lg);
		}

		& hr {
			border-color: var(--blog-divider);
		}
	}

	li.ordered {
		margin-left: var(--blog-spacing-lg);
		list-style-type: decimal;
	}

	li {
		margin-left: var(--blog-spacing-lg);
	}
</style>
