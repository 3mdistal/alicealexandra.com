<script lang="ts">
	import type { RichTextItemResponse } from '$lib/notion/types/notion-types';
	import TextMacro from '$lib/notion/components/text-macro.svelte';
	import WritingEditorShell from '$lib/components/writing-editor-shell.svelte';
	import type { Poem, PoemFrontmatter, Section } from '$lib/content/poems';
	import { onMount } from 'svelte';

	type OwnerStatus = {
		isOwner: boolean;
		owner: {
			login: string;
			name: string | null;
			avatarUrl: string | null;
		} | null;
		authConfigured: boolean;
		publishConfigured: boolean;
	};

	type EditablePoemResponse = {
		frontmatter: PoemFrontmatter;
		content: string;
		checksum: string;
	};

	type EditorDraft = PoemFrontmatter & {
		content: string;
	};

	type SavePoemResponse = {
		commitSha: string;
		commitUrl: string;
		checksum: string;
	};

	type ParagraphBlock = {
		type: 'paragraph';
		paragraph: { rich_text: RichTextItemResponse[] };
	};

	export let data: { poem: Poem; backgroundImage: string | null; sections: Section[] };

	let poem: Poem = data.poem;
	const sections = data.sections;
	const defaultBackgroundImage = data.backgroundImage;
	let ownerStatus: OwnerStatus = {
		isOwner: false,
		owner: null,
		authConfigured: false,
		publishConfigured: false
	};
	let ownerStatusLoaded = false;
	let editorDraft: EditorDraft | null = null;
	let editorChecksum = '';
	let isEditMode = false;
	let isLoadingEditor = false;
	let isSaving = false;
	let editorError = '';
	let editorNotice = '';
	let editorCommitUrl = '';

	function parseMarkdownToBlocks(content: string): ParagraphBlock[] {
		const stanzas = content.split(/\n\n+/).filter((stanza) => stanza.trim());
		return stanzas.map((stanza) => ({
			type: 'paragraph',
			paragraph: {
				rich_text: parseMarkdownToRichText(stanza)
			}
		}));
	}

	function parseMarkdownToRichText(text: string): RichTextItemResponse[] {
		const parts: RichTextItemResponse[] = [];
		const regex = /\*([^*]+)\*/g;
		let lastIndex = 0;
		let match: RegExpExecArray | null;

		while ((match = regex.exec(text)) !== null) {
			if (match.index > lastIndex) {
				parts.push(createRichTextItem(text.slice(lastIndex, match.index), false));
			}
			parts.push(createRichTextItem(match[1] ?? '', true));
			lastIndex = match.index + match[0].length;
		}

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

	$: displayedPoem =
		!isEditMode || !editorDraft
			? poem
			: {
					...poem,
					title: editorDraft.title || poem.title,
					sectionName: editorDraft.section || poem.sectionName,
					notLineated: editorDraft.notLineated,
					sequence: editorDraft.sequence,
					content: editorDraft.content
				};
	$: displayedBackgroundImage =
		sections.find((section) => section.name === displayedPoem.sectionName)?.secondaryImage ||
		defaultBackgroundImage;
	$: poemBlocks = parseMarkdownToBlocks(displayedPoem.content);

	function replaceEditQuery(isEditing: boolean) {
		if (typeof window === 'undefined') {
			return;
		}

		const nextUrl = new URL(window.location.href);
		if (isEditing) {
			nextUrl.searchParams.set('edit', '1');
		} else {
			nextUrl.searchParams.delete('edit');
		}

		window.history.replaceState({}, '', nextUrl);
	}

	async function fetchOwnerStatus() {
		try {
			const response = await fetch('/api/owner/session');
			if (!response.ok) {
				throw new Error('Failed to check owner mode.');
			}

			ownerStatus = (await response.json()) as OwnerStatus;
		} catch (caughtError) {
			editorError =
				caughtError instanceof Error ? caughtError.message : 'Failed to check owner mode.';
		} finally {
			ownerStatusLoaded = true;
		}
	}

	async function openEditor() {
		if (!ownerStatus.isOwner || isLoadingEditor) {
			return;
		}

		isLoadingEditor = true;
		editorError = '';
		editorNotice = '';

		try {
			const response = await fetch(`/api/content/writing/poems/${poem.id}`);
			if (!response.ok) {
				const failure = (await response.json().catch(() => null)) as { message?: string } | null;
				throw new Error(failure?.message ?? 'Failed to load editable poem source.');
			}

			const editablePoem = (await response.json()) as EditablePoemResponse;
			editorDraft = {
				...editablePoem.frontmatter,
				content: editablePoem.content
			};
			editorChecksum = editablePoem.checksum;
			isEditMode = true;
			replaceEditQuery(true);
		} catch (caughtError) {
			editorError =
				caughtError instanceof Error ? caughtError.message : 'Failed to open the poem editor.';
		} finally {
			isLoadingEditor = false;
		}
	}

	function closeEditor() {
		isEditMode = false;
		editorError = '';
		editorNotice = '';
		editorCommitUrl = '';
		replaceEditQuery(false);
	}

	async function saveEditor() {
		if (!editorDraft || isSaving) {
			return;
		}

		isSaving = true;
		editorError = '';
		editorNotice = '';
		editorCommitUrl = '';

		try {
			const response = await fetch(`/api/content/writing/poems/${poem.id}/save`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					frontmatter: {
						title: editorDraft.title,
						section: editorDraft.section,
						sequence: editorDraft.sequence,
						notLineated: editorDraft.notLineated,
						notionId: editorDraft.notionId
					},
					content: editorDraft.content,
					originalChecksum: editorChecksum
				})
			});

			if (!response.ok) {
				const failure = (await response.json().catch(() => null)) as { message?: string } | null;
				throw new Error(failure?.message ?? 'Failed to save poem.');
			}

			const saveResult = (await response.json()) as SavePoemResponse;
			poem = {
				...poem,
				title: editorDraft.title,
				sectionName: editorDraft.section,
				notLineated: editorDraft.notLineated,
				sequence: editorDraft.sequence,
				content: editorDraft.content
			};
			editorChecksum = saveResult.checksum;
			editorCommitUrl = saveResult.commitUrl;
			editorNotice =
				'Saved to teenylilcontent. Your existing site deploy should publish it automatically.';
		} catch (caughtError) {
			editorError = caughtError instanceof Error ? caughtError.message : 'Failed to save poem.';
		} finally {
			isSaving = false;
		}
	}

	onMount(() => {
		void (async () => {
			await fetchOwnerStatus();
			if (
				typeof window !== 'undefined' &&
				ownerStatus.isOwner &&
				new URL(window.location.href).searchParams.get('edit') === '1'
			) {
				await openEditor();
			}
		})();
	});
</script>

<svelte:head>
	<title>{displayedPoem.title} | hymns for calliope</title>
	<meta name="description" content="A poem by Alice Alexandra Moore from hymns for calliope." />
	<meta property="og:title" content="{displayedPoem.title} | hymns for calliope" />
	<meta property="og:description" content="A poem by Alice Alexandra Moore from hymns for calliope." />
</svelte:head>

<div
	class="page-container"
	style="background-image: {displayedBackgroundImage ? `url(${displayedBackgroundImage})` : 'none'};"
>
	<div class="page-overlay"></div>
	<main>
		{#if ownerStatusLoaded && ownerStatus.isOwner}
			<WritingEditorShell
				ownerName={ownerStatus.owner?.name || ownerStatus.owner?.login || 'owner'}
				fileLabel={`${poem.id}.md`}
				isEditMode={isEditMode}
				isLoadingEditor={isLoadingEditor}
				isSaving={isSaving}
				errorMessage={editorError}
				noticeMessage={editorNotice}
				commitUrl={editorCommitUrl}
				on:open={openEditor}
				on:close={closeEditor}
				on:save={saveEditor}
			/>
		{/if}

		{#if isEditMode && editorDraft}
			<div class="editor-layout">
				<form class="editor-pane editor-form" on:submit|preventDefault={saveEditor}>
					<div class="editor-pane-header">
						<h2 class="editor-pane-title">Edit source</h2>
						<p class="editor-pane-copy">
							Edit the poem metadata and markdown together. Use blank lines to separate stanzas.
						</p>
					</div>

					<div class="editor-metadata-grid">
						<label class="editor-field editor-field-wide">
							<span class="editor-field-label">Title</span>
							<input bind:value={editorDraft.title} class="editor-input" type="text" />
						</label>
						<label class="editor-field editor-field-wide">
							<span class="editor-field-label">Section</span>
							<select bind:value={editorDraft.section} class="editor-input">
								{#each sections as section}
									<option value={section.name}>{section.name}</option>
								{/each}
							</select>
						</label>
						<label class="editor-field">
							<span class="editor-field-label">Sequence</span>
							<input bind:value={editorDraft.sequence} class="editor-input" type="number" min="1" />
						</label>
						<label class="editor-field editor-checkbox-field">
							<span class="editor-field-label">Not lineated</span>
							<input bind:checked={editorDraft.notLineated} class="editor-checkbox" type="checkbox" />
						</label>
					</div>

					<div class="editor-readonly-row">
						<p><span>Slug</span><strong>{poem.id}</strong></p>
						<p><span>Notion ID</span><strong>{editorDraft.notionId || '—'}</strong></p>
					</div>

					<label class="editor-field editor-markdown-field">
						<span class="editor-field-label">Markdown source</span>
						<textarea bind:value={editorDraft.content} class="editor-textarea editor-markdown-input"></textarea>
					</label>
				</form>

				<section class="editor-pane preview-pane">
					<div class="editor-pane-header">
						<h2 class="editor-pane-title">Live preview</h2>
						<p class="editor-pane-copy">
							This preview uses the same poem renderer and typography as the live page.
						</p>
					</div>
					<div class="editor-preview-scroll-region">
						<article class="poem-content poem-preview-content">
							{#each poemBlocks as stanza}
								<p
									class={`poem-stanza ${displayedPoem.notLineated ? 'poem-stanza-not-lineated' : 'poem-stanza-lineated'}`}
								>
									<TextMacro type={stanza.paragraph} />
								</p>
							{/each}
						</article>
					</div>
				</section>
			</div>
		{/if}

		{#if !isEditMode}
			<header>
				<p class="collection-name">hymns for calliope</p>
				<h1>{displayedPoem.title}</h1>
				<p class="section-name">{displayedPoem.sectionName}</p>
			</header>

			<article class="poem-content">
				{#each poemBlocks as stanza}
					<p class={`poem-stanza ${displayedPoem.notLineated ? 'poem-stanza-not-lineated' : 'poem-stanza-lineated'}`}>
						<TextMacro type={stanza.paragraph} />
					</p>
				{/each}
			</article>

			<nav class="back-link">
				<a href="/studio/hfc">← back to hymns for calliope</a>
			</nav>
		{/if}
	</main>
</div>

<style>
	.page-container {
		position: relative;
		background-position: center;
		background-size: cover;
		background-color: black;
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
		display: flex;
		position: relative;
		flex-direction: column;
		align-items: center;
		z-index: 1;
		padding: 3rem 1.5rem 6rem;
	}

	header {
		margin-bottom: 4rem;
		max-width: 60ch;
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
		margin-bottom: 6rem;
		width: fit-content;
		max-width: 100%;
		overflow-x: auto;
	}

	.poem-stanza {
		margin-bottom: 2rem;
		color: white;
		font-size: 1.125rem;
		line-height: 1.8;
	}

	.poem-stanza-lineated {
		white-space: pre;
	}

	.poem-stanza-not-lineated {
		max-width: 60ch;
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

	.editor-layout {
		display: grid;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.editor-pane {
		border: 1px solid var(--color-content-border);
		background: color-mix(in srgb, var(--color-content-bg) 96%, var(--color-content-text) 4%);
		padding: 1rem;
		min-width: 0;
	}

	.editor-pane-header {
		margin-bottom: 1rem;
	}

	.editor-pane-title {
		margin: 0 0 0.35rem;
		font-size: 1.35rem;
		font-family: var(--font-serif);
	}

	.editor-metadata-grid {
		display: grid;
		gap: 0.85rem;
	}

	.editor-field {
		display: grid;
		gap: 0.4rem;
	}

	.editor-field-wide {
		grid-column: 1 / -1;
	}

	.editor-field-label {
		color: var(--color-content-secondary);
	}

	.editor-input,
	.editor-textarea {
		border: 1px solid var(--color-content-border);
		background: var(--color-content-bg);
		padding: 0.8rem;
		width: 100%;
		color: var(--color-content-text);
		font: inherit;
	}

	.editor-checkbox-field {
		align-content: end;
	}

	.editor-checkbox {
		margin: 0;
		width: 1rem;
		height: 1rem;
	}

	.editor-readonly-row {
		display: grid;
		gap: 0.75rem;
		margin: 1rem 0;
		border-top: 1px solid var(--color-content-border);
		padding-top: 1rem;
		color: var(--color-content-secondary);
	}

	.editor-readonly-row p {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		margin: 0;
	}

	.editor-readonly-row strong {
		color: var(--color-content-text);
		font-weight: 500;
		font-size: var(--content-font-size-body);
	}

	.editor-markdown-input {
		min-height: 32rem;
		resize: vertical;
		font-size: 0.95rem;
		line-height: 1.7;
		font-family:
			'SFMono-Regular', 'SFMono-Regular Fallback', ui-monospace, 'Cascadia Code', 'Roboto Mono',
			Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
	}

	.preview-pane {
		display: flex;
		flex-direction: column;
	}

	.editor-preview-scroll-region {
		padding-right: 0.35rem;
		min-height: 32rem;
		max-height: 70vh;
		overflow: auto;
	}

	.poem-preview-content {
		margin-bottom: 0;
		width: 100%;
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

	@media (min-width: 768px) {
		.editor-metadata-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.editor-readonly-row {
			grid-template-columns: repeat(2, minmax(0, 1fr));
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

	@media (min-width: 1280px) {
		.editor-layout {
			grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
			align-items: start;
		}

		.preview-pane {
			position: sticky;
			top: 2rem;
		}

		.editor-preview-scroll-region {
			max-height: calc(100vh - 8rem);
		}
	}
</style>
