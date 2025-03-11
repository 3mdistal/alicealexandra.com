<script lang="ts">
	import type {
		RichTextItemResponse,
		TextRichTextItemResponse
	} from '$lib/notion/types/notion-types';
	export let type: { rich_text: Array<RichTextItemResponse> };
	export let paragraphs: boolean = false;

	function isTextRichTextItem(item: RichTextItemResponse): item is TextRichTextItemResponse {
		return item.type === 'text';
	}
</script>

{#each type.rich_text as rich_text}
	{#if isTextRichTextItem(rich_text)}
		{#if rich_text.href}
			<a href={rich_text.href}>{rich_text.text.content}</a>
		{:else if rich_text.annotations.code}
			<code>{rich_text.text.content}</code>
		{:else if rich_text.annotations.italic}
			<em>{rich_text.text.content}</em>
		{:else if rich_text.annotations.bold}
			<strong>{rich_text.text.content}</strong>
		{:else if rich_text.annotations.strikethrough}
			<span class="line-through">{rich_text.text.content}</span>
		{:else if paragraphs === true}
			<p>{rich_text.text.content}</p>
		{:else}
			{rich_text.text.content}
		{/if}
	{:else if rich_text.type === 'mention'}
		<!-- Handle mentions -->
		<span class="mention">{rich_text.plain_text}</span>
	{:else if rich_text.type === 'equation'}
		<!-- Handle equations -->
		<span class="equation">{rich_text.plain_text}</span>
	{/if}
{/each}

<style>
	em,
	strong,
	span {
		color: inherit;
	}

	a {
		transition: color 0.2s ease;
		color: var(--blog-link-light, #d1dce7);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}

	a:hover {
		color: var(--blog-text-light, #ffffff);
	}

	code {
		border-radius: var(--blog-border-radius-sm, 0.25rem);
		background-color: var(--blog-code-bg, rgba(0, 0, 0, 0.2));
		padding: 0.1em 0.3em;
		font-size: 0.9em;
		font-family: 'Cutive Mono', monospace;
	}

	strong {
		font-weight: 600;
	}

	span.line-through {
		text-decoration: line-through;
	}

	span.mention {
		color: var(--blog-accent-light, rgba(255, 255, 255, 0.9));
		font-weight: 500;
	}

	span.equation {
		color: var(--blog-accent-light, rgba(255, 255, 255, 0.9));
		font-style: italic;
	}
</style>
