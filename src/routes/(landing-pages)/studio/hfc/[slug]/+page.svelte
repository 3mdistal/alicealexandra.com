<script lang="ts">
	import type { RichTextItemResponse } from '$lib/notion/types/notion-types';
	import TextMacro from '$lib/notion/components/text-macro.svelte';

	let { data } = $props();
	const poem = data.poem;
	const backgroundImage = data.backgroundImage;

	type ParagraphBlock = {
		type: 'paragraph';
		paragraph: { rich_text: RichTextItemResponse[] };
	};

	// Parse markdown content into block format for TextMacro component
	function parseMarkdownToBlocks(content: string): ParagraphBlock[] {
		const stanzas = content.split(/\n\n+/).filter((s) => s.trim());
		return stanzas.map((stanza) => ({
			type: 'paragraph',
			paragraph: {
				rich_text: parseMarkdownToRichText(stanza)
			}
		}));
	}

	function parseMarkdownToRichText(text: string): RichTextItemResponse[] {
		// Simple regex-based parsing for italics
		const parts: RichTextItemResponse[] = [];

		// Match *italic* patterns
		const regex = /\*([^*]+)\*/g;
		let lastIndex = 0;
		let match: RegExpExecArray | null;

		while ((match = regex.exec(text)) !== null) {
			// Add text before the match
			if (match.index > lastIndex) {
				const plainText = text.slice(lastIndex, match.index);
				parts.push(createRichTextItem(plainText, false));
			}
			// Add the italic text
			parts.push(createRichTextItem(match[1] ?? '', true));
			lastIndex = match.index + match[0].length;
		}

		// Add remaining text
		if (lastIndex < text.length) {
			parts.push(createRichTextItem(text.slice(lastIndex), false));
		}

		return parts.length > 0 ? parts : [createRichTextItem(text, false)];
	}

	function createRichTextItem(content: string, italic: boolean): RichTextItemResponse {
		return {
			type: 'text' as const,
			plain_text: content,
			text: { content, link: null },
			annotations: {
				bold: false,
				italic,
				strikethrough: false,
				underline: false,
				code: false,
				color: 'default' as const
			},
			href: null
		};
	}

	const poemBlocks = parseMarkdownToBlocks(poem.content);
</script>

<svelte:head>
	<title>{poem.title} | hymns for calliope</title>
	<meta name="description" content="A poem by Alice Alexandra Moore from hymns for calliope." />
	<meta property="og:title" content="{poem.title} | hymns for calliope" />
	<meta
		property="og:description"
		content="A poem by Alice Alexandra Moore from hymns for calliope."
	/>
</svelte:head>

<div class="page-container" style="background-image: {backgroundImage ? `url(${backgroundImage})` : 'none'};">
	<div class="page-overlay"></div>
	<main>
		<header>
			<p class="collection-name">hymns for calliope</p>
			<h1>{poem.title}</h1>
			<p class="section-name">{poem.sectionName}</p>
		</header>

		<article class="poem-content">
			{#each poemBlocks as stanza}
				<p class="poem-stanza" style="white-space: {poem.notLineated === false ? 'pre' : ''}; max-width: {poem.notLineated === true ? '60ch' : 'none'}">
					<TextMacro type={stanza.paragraph} />
				</p>
			{/each}
		</article>

		<nav class="back-link">
			<a href="/studio/hfc">← back to hymns for calliope</a>
		</nav>
	</main>
</div>

<style>
	.page-container {
		position: relative;
		background-color: black;
		background-position: center;
		background-size: cover;
		min-height: 100vh;
	}

	.page-overlay {
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0.8;
		background-color: black;
		width: 100%;
		height: 100%;
	}

	main {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 3rem 1.5rem 6rem;
	}

	header {
		max-width: 60ch;
		margin-bottom: 4rem;
		text-align: center;
	}

	.collection-name {
		margin-bottom: 0.5rem;
		color: #888;
		font-size: 0.875rem;
		letter-spacing: 0.1em;
		text-transform: lowercase;
	}

	h1 {
		margin-bottom: 0.5rem;
		color: white;
		font-weight: 300;
		font-size: 2.25rem;
	}

	.section-name {
		color: #bcbab7;
		font-style: italic;
		font-size: 1rem;
	}

	.poem-content {
		width: fit-content;
		max-width: 100%;
		margin-bottom: 6rem;
		overflow-x: auto;
	}

	.poem-stanza {
		margin-bottom: 2rem;
		color: white;
		font-size: 1.125rem;
		line-height: 1.8;
	}

	.back-link {
		text-align: center;
	}

	.back-link a {
		transition: color 0.2s;
		color: #888;
		font-size: 1.125rem;
		text-decoration: none;
	}

	.back-link a:hover {
		color: #bcbab7;
	}

	@media (min-width: 640px) {
		.page-container {
			background-attachment: fixed;
		}

		main {
			padding: 4rem 2rem 8rem;
		}

		h1 {
			font-size: 3rem;
		}

		.poem-stanza {
			font-size: 1.25rem;
		}
	}

	@media (min-width: 1024px) {
		h1 {
			font-size: 3.75rem;
		}

		.poem-stanza {
			font-size: 1.5rem;
		}
	}
</style>
