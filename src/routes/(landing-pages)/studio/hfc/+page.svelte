<script lang="ts">
	import TextMacro from '$lib/notion/components/text-macro.svelte';
	import type { RichTextItemResponse } from '$lib/notion/types/notion-types';
	import { pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';

	let { data }: { data: Data } = $props();

	type PoemResults = {
		id: string;
		content: string; // Pre-loaded markdown content
		properties: {
			Name: {
				type: 'title';
				title: [
					{
						plain_text: string;
					}
				];
			};
			sectionName: {
				type: 'formula';
				formula: {
					string: string;
				};
			};
			NotLineated: {
				type: 'checkbox';
				checkbox: boolean;
			};
		};
	};

	type SectionResults = {
		cover: {
			type: 'external';
			external: {
				url: string;
			};
		};
		id: string;
		properties: {
			Name: {
				type: 'title';
				title: [
					{
						plain_text: string;
					}
				];
			};
			Quote: {
				type: 'rich_text';
				rich_text: RichTextItemResponse[];
			};
			QuoteAuthor: {
				type: 'rich_text';
				rich_text: RichTextItemResponse[];
			};
			Act: {
				type: 'rich_text';
				rich_text: RichTextItemResponse[];
			};
			secondaryImage: {
				type: 'url';
				url: string;
			};
		};
	};

	type Data = {
		props: {
			sections: { results: Array<SectionResults> };
			poems: { results: Array<PoemResults> };
		};
	};

	const {
		props: {
			sections: { results: sections },
			poems: { results: poems }
		}
	} = data;

	let open: Record<string, boolean> = $state({});

	type ParagraphBlock = {
		type: 'paragraph';
		paragraph: { rich_text: RichTextItemResponse[] };
	};

	// Pre-parse all poem content from markdown to block format at load time
	let poemContent: Record<string, ParagraphBlock[]> = {};
	for (const poem of poems) {
		poemContent[poem.id] = parseMarkdownToBlocks(poem.content);
	}

	let Piano =
		'https://ik.imagekit.io/tempoimmaterial/tr:w-1500/hymns%20for%20calliope/ruined%20piano?updatedAt=1694350822403';

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

	// Track which poem was opened via toggleOpen to avoid effect conflicts
	let lastToggledPoemId: string | null = $state(null);

	function toggleOpen(poemId: string) {
		const isOpening = !open[poemId];

		// Close all other poems first
		for (const id of Object.keys(open)) {
			if (id !== poemId) {
				open[id] = false;
			}
		}

		open[poemId] = isOpening;
		lastToggledPoemId = isOpening ? poemId : null;

		if (isOpening) {
			// Update URL when opening a poem (shallow routing)
			pushState(`/studio/hfc/${poemId}`, { openPoemId: poemId });
		} else {
			// Reset URL when closing
			replaceState('/studio/hfc', {});
		}
	}

	// Handle browser back/forward navigation
	$effect(() => {
		const stateOpenPoemId = (page.state as any)?.openPoemId as string | undefined;

		// Skip if this state change was triggered by our own toggleOpen
		if (stateOpenPoemId === lastToggledPoemId) {
			return;
		}

		if (stateOpenPoemId) {
			// Open the poem from state (browser navigation)
			for (const id of Object.keys(open)) {
				open[id] = false;
			}
			open[stateOpenPoemId] = true;
			lastToggledPoemId = stateOpenPoemId;
			// Scroll to the poem after a brief delay to allow render
			setTimeout(() => scroll(`poem-${stateOpenPoemId}`, 'smooth'), 100);
		} else {
			// Close all poems when navigating back to base URL
			for (const id of Object.keys(open)) {
				open[id] = false;
			}
			lastToggledPoemId = null;
		}
	});

	// eslint-disable-next-line
	function scroll(id: string, behavior: ScrollBehavior) {
		const element = document.getElementById(id);
		if (!element) return;
		element.scrollIntoView({ behavior });
	}
</script>

<svelte:head>
	<title>hymns for calliope</title>
	<meta name="description" content="Collected poems by Alice Alexandra Moore." />
</svelte:head>

<div class="page-container">
	<div class="snap-container">
		<div class="hero-image" style="background-image: url({Piano})">
			<div class="hero-content">
				<h1>hymns for calliope</h1>
				<p>poems</p>
			</div>
			<div class="hero-overlay"></div>
		</div>
	</div>
	{#each sections as section}
		{#if section.properties['Name'].title[0].plain_text === 'introduction'}
			<div class="introduction">
				<div class="introduction-content">
					<h2>Author's Note</h2>
					<p>
						<em><TextMacro type={section.properties['Quote']} /></em>
					</p>
				</div>
			</div>
		{:else if section.properties['Name'] && section.cover}
			<div class="section-container">
				<div class="section-image-container">
					<div class="section-image">
						<img
							src={section.cover.type === 'external' ? section.cover.external.url : ''}
							alt=""
							loading="lazy"
						/>
					</div>
					<a
						class="section-link"
						href={`#${section.id}`}
						onclick={(e) => {
							e.preventDefault();
							scroll(section.id, 'smooth');
						}}
					>
						<p class="section-act">
							{#if section.properties['Act'] && section.properties['Act'].type === 'rich_text'}
								<TextMacro type={section.properties['Act']} />
							{:else}
								''
							{/if}
						</p>
						<h2 class="section-title">
							{section.properties['Name'].type === 'title' && section.properties['Name'].title[0]
								? section.properties['Name'].title[0].plain_text
								: 'Title Missing in CMS'}
						</h2>
					</a>
				</div>
				<div class="section-quote-container">
					<div class="section-quote">
						<p class="quote-text">
							<em>
								<TextMacro type={section.properties['Quote']} />
							</em>
						</p>
						<p class="quote-author">
							—<TextMacro type={section.properties['QuoteAuthor']} />
						</p>
					</div>
				</div>
			</div>
			<div
				id={section.id}
				class="poem-section"
				style="background-image: url({section.properties.secondaryImage.url});"
			>
				<div class="poem-overlay"></div>
				<div class="poem-container">
					{#each poems as poem}
						{#if poem.properties['sectionName'].formula.string === section.properties.Name.title[0].plain_text}
							<button
								class="poem-link"
								type="button"
								aria-expanded={open[poem.id] === true}
								aria-controls={`poem-${poem.id}`}
								onclick={() => toggleOpen(poem.id)}
							>
								<h3 class="poem-title">
									{poem.properties.Name.title[0].plain_text}
								</h3>
							</button>
							{#if open[poem.id] === true}
								<div class="poem-content" id={`poem-${poem.id}`}>
									{#each poemContent[poem.id] ?? [] as stanza}
										<p
											class="poem-stanza"
											style="white-space: {poem.properties.NotLineated.checkbox === false
												? 'pre'
												: ''}"
										>
											<TextMacro type={stanza.paragraph} />
										</p>
									{/each}
									<a
										onclick={(e) => {
											e.preventDefault();
											toggleOpen(poem.id);
										}}
										href="/studio/hfc"
										class="close-poem">close.</a
									>
								</div>
							{/if}
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	{/each}
</div>

<style>
	.page-container {
		background-color: black;
		height: 100vh;
		overflow-y: scroll;
	}

	.snap-container {
		scroll-snap-align: start;
	}

	.hero-image {
		position: relative;
		margin: 0 auto;
		background-position: center;
		background-size: cover;
		aspect-ratio: 1 / 1;

		@media (min-width: 768px) {
			background-attachment: fixed;
			aspect-ratio: auto;
			height: 100lvh;
		}
	}

	.hero-content {
		position: absolute;
		top: 30%;
		left: 10%;
		z-index: 10;

		h1 {
			color: white;
			font-size: 1.875rem;

			@media (min-width: 768px) {
				font-size: 2.25rem;
			}

			@media (min-width: 1024px) {
				font-size: 3rem;
			}

			@media (min-width: 1280px) {
				font-size: 3.75rem;
			}
		}

		p {
			color: white;
		}
	}

	.hero-overlay {
		position: absolute;
		opacity: 0.6;
		background-color: black;
		width: 100%;
		height: 100%;
	}

	.introduction {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 2.5rem 1.25rem;
		min-height: 100lvh;
		scroll-snap-align: start;

		@media (min-width: 768px) {
			padding: 2.5rem;
		}
	}

	.introduction-content {
		display: flex;
		flex-direction: column;
		max-width: 60ch;

		h2 {
			color: white;
			font-weight: 300;
			font-size: 1.5rem;

			@media (min-width: 640px) {
				font-size: 1.875rem;
			}

			@media (min-width: 1280px) {
				font-size: 2.25rem;
			}
		}

		p {
			font-size: 1.1rem;
			white-space: pre-line;

			@media (min-width: 640px) {
				font-size: 1.25rem;
			}

			@media (min-width: 768px) {
				font-size: 1.5rem;
			}

			em {
				color: #cfcdcb;
			}
		}
	}

	.section-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 6rem;
		background-color: #bcbab7;
		padding: 1rem;
		min-height: 100lvh;
		scroll-snap-align: start;

		@media (min-width: 640px) {
			gap: 8rem;
		}

		@media (min-width: 1024px) {
			gap: 3rem;
		}
	}

	.section-image-container {
		display: grid;
		position: relative;
		grid-template-rows: repeat(6, minmax(0, 1fr));
		grid-template-columns: repeat(6, minmax(0, 1fr));
		min-height: 40lvh;

		@media (min-width: 1024px) {
			display: flex;
			align-items: center;
		}

		@media (min-width: 1536px) {
			padding: 0 8rem;
		}
	}

	.section-image {
		grid-row: span 6 / span 6;
		grid-row-start: 1;
		grid-column: span 5 / span 5;
		grid-column-start: 1;

		@media (min-width: 1024px) {
			grid-column: span 4 / span 4;
			transform: translateX(2.5rem);
		}
	}

	.section-link {
		position: absolute;
		grid-row-start: 5;
		grid-column-start: 3;
		background-color: white;
		padding: 2rem 1rem;
		min-width: 60vw;

		&:hover {
			background-color: #deddda;
			text-decoration: none;
		}

		@media (min-width: 640px) {
			grid-row-start: 6;
		}

		@media (min-width: 1024px) {
			position: static;
			grid-row-start: 4;
			grid-column-start: 4;
			transform: translate(-2.5rem, 5rem);
			min-width: 35ch;
			font-size: 1.5rem;
		}

		@media (min-width: 1280px) {
			font-size: 1.875rem;
		}
	}

	.section-act {
		color: black;
		font-size: 0.875rem;
		text-align: center;

		@media (min-width: 640px) {
			font-size: 1.125rem;
		}
	}

	.section-title {
		margin: 0;
		color: black;
		font-weight: 300;
		font-size: 1.5rem;
		text-align: center;

		@media (min-width: 640px) {
			font-size: 1.875rem;
		}

		@media (min-width: 1280px) {
			font-size: 2.25rem;
		}
	}

	.section-quote-container {
		@media (min-width: 640px) {
			padding: 0 2.5rem;
		}

		@media (min-width: 768px) {
			padding: 0 5rem;
		}

		@media (min-width: 1024px) {
			padding: 0 8rem;
		}

		@media (min-width: 1280px) {
			padding: 0 13rem;
		}

		@media (min-width: 1536px) {
			padding: 0 26rem;
		}
	}

	.section-quote {
		background-color: black;
		padding: 2rem;

		@media (min-width: 1024px) {
			padding: 5rem;
		}
	}

	.quote-text {
		margin-bottom: 1rem;
		font-size: 1.1rem;

		@media (min-width: 640px) {
			font-size: 1.25rem;
		}

		@media (min-width: 768px) {
			font-size: 1.5rem;
		}

		em {
			color: #cfcdcb;
		}
	}

	.quote-author {
		color: white;
		font-size: 0.875rem;

		@media (min-width: 768px) {
			font-size: 1.125rem;
		}
	}

	.poem-section {
		display: flex;
		position: relative;
		align-items: center;
		background-position: center;
		background-size: cover;
		padding: 5rem 0;
		min-height: 100lvh;
		scroll-snap-align: start;

		@media (min-width: 640px) {
			background-attachment: fixed;
		}
	}

	.poem-overlay {
		position: absolute;
		opacity: 0.8;
		background-color: black;
		width: 100%;
		height: 100%;
	}

	.poem-container {
		display: flex;
		position: relative;
		flex-direction: column;
		gap: 5rem;
		z-index: 10;
		padding: 0 1.25rem;
		width: 100%;
		overflow-x: scroll;

		@media (min-width: 768px) {
			align-items: center;
			overflow-x: visible;
		}
	}

	.poem-link {
		cursor: pointer;
		border: 0;
		background: none;
		padding: 1rem;
		color: inherit;
		font: inherit;

		&:hover {
			text-decoration: none;
		}

		&:hover h3 {
			color: #bcbab7;
		}
	}

	.poem-title {
		color: white;
		font-weight: 300;
		font-size: 1.875rem;
		text-align: center;

		@media (min-width: 768px) {
			font-size: 2.25rem;
		}

		@media (min-width: 1024px) {
			font-size: 3rem;
		}
	}

	.poem-content {
		margin-top: -3rem;
	}

	.poem-stanza {
		margin-bottom: 2rem;
		max-width: 60ch;
		color: white;
		font-size: 0.875rem;

		@media (min-width: 640px) {
			font-size: 1.125rem;
		}

		@media (min-width: 768px) {
			font-size: 1.25rem;
		}

		@media (min-width: 1280px) {
			font-size: 1.5rem;
		}
	}

	.close-poem {
		margin-top: 8rem;
		color: white;
		font-size: 1.5rem;
		text-align: right;

		&:hover {
			color: #bcbab7;
			text-decoration: none;
		}

		@media (min-width: 768px) {
			font-size: 1.875rem;
		}

		@media (min-width: 1024px) {
			font-size: 2.25rem;
		}
	}
</style>
