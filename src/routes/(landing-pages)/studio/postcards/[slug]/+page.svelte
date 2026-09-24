<script lang="ts">
	import '$lib/styles/prose.css';
	import { marked } from 'marked';
	import WritingEditorShell from '$lib/components/writing-editor-shell.svelte';
	import type { Postcard, PostcardFrontmatter } from '$lib/content/postcards';
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

	type EditablePostcardResponse = {
		frontmatter: PostcardFrontmatter;
		content: string;
		checksum: string;
	};

	type EditorDraft = PostcardFrontmatter & {
		content: string;
	};

	type SavePostcardResponse = {
		commitSha: string;
		commitUrl: string;
		checksum: string;
		lastEditedTime: string;
	};

	export let data: { postcard: Postcard };

	let postcard: Postcard = data.postcard;
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

	$: displayedPostcard =
		!isEditMode || !editorDraft
			? postcard
			: {
					...postcard,
					title: editorDraft.title,
					slug: editorDraft.slug,
					description: editorDraft.description,
					lastEditedTime: editorDraft.lastEditedTime,
					notionId: editorDraft.notionId,
					content: editorDraft.content,
					...(editorDraft.heroImage ? { heroImage: editorDraft.heroImage } : {})
				};
	$: htmlContent = marked.parse(displayedPostcard.content);

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
			const response = await fetch(`/api/content/writing/postcards/${postcard.slug}`);
			if (!response.ok) {
				const failure = (await response.json().catch(() => null)) as { message?: string } | null;
				throw new Error(failure?.message ?? 'Failed to load editable postcard source.');
			}

			const editablePostcard = (await response.json()) as EditablePostcardResponse;
			editorDraft = {
				...editablePostcard.frontmatter,
				content: editablePostcard.content
			};
			editorChecksum = editablePostcard.checksum;
			isEditMode = true;
			replaceEditQuery(true);
		} catch (caughtError) {
			editorError =
				caughtError instanceof Error ? caughtError.message : 'Failed to open the postcard editor.';
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
			const response = await fetch(`/api/content/writing/postcards/${postcard.slug}/save`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					frontmatter: {
						title: editorDraft.title,
						slug: editorDraft.slug,
						description: editorDraft.description,
						heroImage: editorDraft.heroImage,
						lastEditedTime: editorDraft.lastEditedTime,
						notionId: editorDraft.notionId
					},
					content: editorDraft.content,
					originalChecksum: editorChecksum
				})
			});

			if (!response.ok) {
				const failure = (await response.json().catch(() => null)) as { message?: string } | null;
				throw new Error(failure?.message ?? 'Failed to save postcard.');
			}

			const saveResult = (await response.json()) as SavePostcardResponse;
			editorDraft = {
				...editorDraft,
				lastEditedTime: saveResult.lastEditedTime
			};
			postcard = {
				...postcard,
				title: editorDraft.title,
				description: editorDraft.description,
				lastEditedTime: saveResult.lastEditedTime,
				notionId: editorDraft.notionId,
				content: editorDraft.content,
				...(editorDraft.heroImage ? { heroImage: editorDraft.heroImage } : {})
			};
			editorChecksum = saveResult.checksum;
			editorCommitUrl = saveResult.commitUrl;
			editorNotice =
				'Saved to teenylilcontent. Your existing site deploy should publish it automatically.';
		} catch (caughtError) {
			editorError = caughtError instanceof Error ? caughtError.message : 'Failed to save postcard.';
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
	<title>{displayedPostcard.title || 'Postcard'}</title>
	<meta name="description" content={displayedPostcard.description} />
	<meta name="og:title" content={displayedPostcard.title || 'Postcard'} />
	<meta name="og:description" content={displayedPostcard.description} />
	{#if displayedPostcard.heroImage}
		<meta name="og:image" content={displayedPostcard.heroImage} />
	{/if}
</svelte:head>

{#if displayedPostcard.heroImage && !isEditMode}
	<div class="hero-container">
		<div
			class="hero-image"
			style="background-image: url('{displayedPostcard.heroImage}'); view-transition-name: postcard-hero-{displayedPostcard.slug}"
		></div>
		<div class="hero-overlay">
			<div class="hero-content">
				<h1>{displayedPostcard.title}</h1>
				{#if displayedPostcard.description}
					<p class="description">{displayedPostcard.description}</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<main>
	{#if ownerStatusLoaded && ownerStatus.isOwner}
		<WritingEditorShell
			ownerName={ownerStatus.owner?.name || ownerStatus.owner?.login || 'owner'}
			fileLabel={`${postcard.slug}.md`}
			{isEditMode}
			{isLoadingEditor}
			{isSaving}
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
						Edit the postcard metadata and markdown together. The publish step also refreshes
						postcard listing metadata.
					</p>
				</div>

				<div class="editor-metadata-grid">
					<label class="editor-field editor-field-wide">
						<span class="editor-field-label">Title</span>
						<input bind:value={editorDraft.title} class="editor-input" type="text" />
					</label>
					<label class="editor-field editor-field-wide">
						<span class="editor-field-label">Description</span>
						<textarea
							bind:value={editorDraft.description}
							class="editor-textarea editor-meta-textarea"></textarea>
					</label>
					<label class="editor-field editor-field-wide">
						<span class="editor-field-label">Hero image URL</span>
						<input bind:value={editorDraft.heroImage} class="editor-input" type="url" />
					</label>
				</div>

				<div class="editor-readonly-row editor-readonly-row-wide">
					<p><span>Slug</span><strong>{editorDraft.slug}</strong></p>
					<p><span>Last edited</span><strong>{editorDraft.lastEditedTime || '—'}</strong></p>
					<p><span>Notion ID</span><strong>{editorDraft.notionId}</strong></p>
				</div>

				<label class="editor-field editor-markdown-field">
					<span class="editor-field-label">Markdown source</span>
					<textarea bind:value={editorDraft.content} class="editor-textarea editor-markdown-input"
					></textarea>
				</label>
			</form>

			<section class="editor-pane preview-pane">
				<div class="editor-pane-header">
					<h2 class="editor-pane-title">Live preview</h2>
					<p class="editor-pane-copy">
						This preview uses the same markdown rendering and prose styles as the live postcard.
					</p>
				</div>
				<div class="editor-preview-scroll-region">
					<div class="editor-preview-card">
						{#if displayedPostcard.heroImage}
							<div
								class="editor-preview-hero-image"
								style="background-image: url('{displayedPostcard.heroImage}')"
							></div>
						{/if}
						<div class="editor-preview-copy">
							<h2 class="editor-preview-title">{displayedPostcard.title}</h2>
							{#if displayedPostcard.description}
								<p class="editor-preview-description">{displayedPostcard.description}</p>
							{/if}
							<div class="prose editor-preview-prose">
								{@html htmlContent}
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	{/if}

	{#if !isEditMode}
		<article class="postcard-content">
			{#if htmlContent}
				<div class="prose">
					{@html htmlContent}
				</div>
			{:else}
				<p>No content available.</p>
			{/if}
		</article>

		<nav class="back-link">
			<a href="/studio/postcards">← Back to Postcards</a>
		</nav>
	{/if}
</main>

<style>
	.hero-container {
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		width: 100vw;
	}

	.hero-image {
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		aspect-ratio: 3 / 2;
		width: 100%;
		height: 100%;
	}

	.hero-overlay {
		display: flex;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		justify-content: center;
		align-items: flex-end;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, transparent 100%, var(--color-content-bg)) 0%,
			color-mix(in srgb, transparent 80%, var(--color-content-bg)) 40%,
			color-mix(in srgb, transparent 35%, var(--color-content-bg)) 70%,
			var(--color-content-bg) 100%
		);
		padding: 3rem;
		padding-bottom: 14rem;
	}

	.hero-content {
		max-width: 800px;
		text-align: center;
	}

	.hero-content h1 {
		margin: 0 0 0.75rem 0;
		color: var(--color-content-text);
		font-weight: 500;
		font-size: 4.4rem;
		line-height: 1.1;
		font-family: 'Spectral', serif;
		letter-spacing: 0.05em;
		text-shadow:
			0 0 25px color-mix(in srgb, var(--color-content-bg) 70%, transparent),
			0 0 50px color-mix(in srgb, var(--color-content-bg) 40%, transparent),
			0 2px 4px color-mix(in srgb, var(--color-content-bg) 25%, transparent);
	}

	.hero-content .description {
		margin: 0;
		color: var(--color-content-secondary);
		font-style: italic;
		font-size: 1.75rem;
		line-height: 1.4;
		font-family: 'Spectral', serif;
		letter-spacing: 0.05em;
		text-shadow:
			0 0 20px color-mix(in srgb, var(--color-content-bg) 70%, transparent),
			0 0 40px color-mix(in srgb, var(--color-content-bg) 40%, transparent);
	}

	main {
		position: relative;
		z-index: 1;
		margin: -10rem auto 0;
		background-color: transparent;
		padding: 2rem;
		max-width: 800px;
		min-height: 100vh;
		line-height: 1.6;
	}

	.postcard-content {
		margin-bottom: 3rem;
	}

	.back-link {
		margin-top: 9rem;
		text-align: center;
	}

	.back-link a {
		transition: background-color 0.2s;
		border: 1px solid var(--color-content-border);
		border-radius: 4px;
		padding: 0.5rem 1rem;
		color: var(--color-content-secondary);
		font-size: 1.1rem;
		text-decoration: none;
	}

	.back-link a:hover {
		background-color: color-mix(in srgb, var(--color-content-bg) 88%, var(--color-content-text));
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

	.editor-meta-textarea {
		min-height: 5.5rem;
		resize: vertical;
	}

	.editor-readonly-row {
		display: grid;
		gap: 0.75rem;
		margin: 1rem 0;
		border-top: 1px solid var(--color-content-border);
		padding-top: 1rem;
		color: var(--color-content-secondary);
	}

	.editor-readonly-row-wide {
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
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

	.editor-preview-card {
		border: 1px solid var(--color-content-border);
		background: color-mix(in srgb, var(--color-content-bg) 96%, var(--color-content-text) 4%);
	}

	.editor-preview-hero-image {
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		aspect-ratio: 3 / 2;
		width: 100%;
	}

	.editor-preview-copy {
		padding: 1.5rem;
	}

	.editor-preview-title {
		margin: 0 0 0.75rem;
		color: var(--color-content-text);
		font-size: 2rem;
		font-family: 'Spectral', serif;
	}

	.editor-preview-description {
		margin: 0 0 1.5rem;
		color: var(--color-content-secondary);
		font-style: italic;
		font-size: 1.2rem;
		font-family: 'Spectral', serif;
	}

	.editor-preview-prose {
		margin: 0;
	}

	@media (max-width: 768px) {
		.hero-overlay {
			padding: 2rem;
			padding-bottom: 10rem;
		}

		.hero-content h1 {
			font-size: 3rem;
		}

		.hero-content .description {
			font-size: 1.4rem;
		}

		main {
			margin-top: -8rem;
		}

		.editor-metadata-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.hero-overlay {
			padding: 1.5rem;
			padding-bottom: 8rem;
		}

		.hero-content h1 {
			font-size: 2.2rem;
		}

		.hero-content .description {
			font-size: 1.1rem;
		}

		main {
			margin-top: -6rem;
		}
	}

	@media (min-width: 768px) {
		.editor-metadata-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
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
