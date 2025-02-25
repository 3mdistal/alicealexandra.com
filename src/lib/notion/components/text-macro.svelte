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
		color: var(--blog-link);
		text-decoration: underline;

		&:hover {
			color: var(--blog-link-hover);
		}
	}

	code {
		border-radius: var(--blog-border-radius-sm);
		background-color: var(--blog-inline-code-bg);
		padding: 0.1em 0.3em;
		font-size: var(--blog-code);
		font-family: monospace;
	}

	span {
		&.line-through {
			text-decoration: line-through;
		}

		&.mention {
			color: var(--blog-mention);
			font-weight: 500;
		}

		&.equation {
			color: var(--blog-equation);
			font-style: italic;
		}
	}
</style>
