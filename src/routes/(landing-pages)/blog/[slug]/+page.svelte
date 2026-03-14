<script lang="ts">
	import BlogHeader from '$lib/components/blog-header.svelte';
	import BlogMarkdownContent from '$lib/components/blog-markdown-content.svelte';
	import type { BlogPost } from '$lib/content/blog';
	import type { BlogFrontmatter } from '$lib/content/blog-source';
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

	type EditableBlogResponse = {
		frontmatter: BlogFrontmatter;
		content: string;
		checksum: string;
	};

	type EditorDraft = BlogFrontmatter & {
		content: string;
	};

	type SaveBlogResponse = {
		commitSha: string;
		commitUrl: string;
		checksum: string;
		readTime: string;
	};

	export let data: { post: BlogPost };

	let post: BlogPost = data.post;
	let displayedPost: BlogPost = post;
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

	function estimateReadTime(content: string): string {
		const wordCount = content.match(/\b[\w'-]+\b/g)?.length ?? 0;
		const minutes = Math.max(1, Math.ceil(wordCount / 225));
		return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
	}

	$: displayedPost =
		!isEditMode || !editorDraft
			? post
			: {
					...post,
					title: editorDraft.title || post.title,
					subtitle: editorDraft.subtitle,
					summary: editorDraft.summary,
					ogDescription: editorDraft.ogDescription,
					category: editorDraft.category,
					publicationDate: editorDraft.publicationDate,
					formattedPublicationDate: editorDraft.formattedPublicationDate,
					coverImage: editorDraft.coverImage,
					coverImageCaption: editorDraft.coverImageCaption,
					notionId: editorDraft.notionId,
					content: editorDraft.content,
					readTime: estimateReadTime(editorDraft.content)
				};

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
			const response = await fetch(`/api/content/blog/${post.slug}`);
			if (!response.ok) {
				const failure = (await response.json().catch(() => null)) as { message?: string } | null;
				throw new Error(failure?.message ?? 'Failed to load editable blog source.');
			}

			const editablePost = (await response.json()) as EditableBlogResponse;
			editorDraft = {
				...editablePost.frontmatter,
				content: editablePost.content
			};
			editorChecksum = editablePost.checksum;
			isEditMode = true;
			replaceEditQuery(true);
		} catch (caughtError) {
			editorError =
				caughtError instanceof Error ? caughtError.message : 'Failed to open the blog editor.';
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
			const response = await fetch(`/api/content/blog/${post.slug}/save`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					frontmatter: {
						title: editorDraft.title,
						slug: editorDraft.slug,
						subtitle: editorDraft.subtitle,
						summary: editorDraft.summary,
						ogDescription: editorDraft.ogDescription,
						category: editorDraft.category,
						publicationDate: editorDraft.publicationDate,
						formattedPublicationDate: editorDraft.formattedPublicationDate,
						coverImage: editorDraft.coverImage,
						coverImageCaption: editorDraft.coverImageCaption,
						notionId: editorDraft.notionId
					},
					content: editorDraft.content,
					originalChecksum: editorChecksum
				})
			});

			if (!response.ok) {
				const failure = (await response.json().catch(() => null)) as { message?: string } | null;
				throw new Error(failure?.message ?? 'Failed to save blog post.');
			}

			const saveResult = (await response.json()) as SaveBlogResponse;
			post = {
				...post,
				title: editorDraft.title,
				subtitle: editorDraft.subtitle,
				summary: editorDraft.summary,
				ogDescription: editorDraft.ogDescription,
				category: editorDraft.category,
				publicationDate: editorDraft.publicationDate,
				formattedPublicationDate: editorDraft.formattedPublicationDate,
				coverImage: editorDraft.coverImage,
				coverImageCaption: editorDraft.coverImageCaption,
				notionId: editorDraft.notionId,
				content: editorDraft.content,
				readTime: saveResult.readTime
			};
			editorChecksum = saveResult.checksum;
			editorCommitUrl = saveResult.commitUrl;
			editorNotice = 'Saved to teenylilcontent. Your existing site deploy should publish it automatically.';
		} catch (caughtError) {
			editorError =
				caughtError instanceof Error ? caughtError.message : 'Failed to save blog post.';
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
	<title>{displayedPost.title || 'Blog'}</title>
	<meta name="og:title" content={displayedPost.title || 'Blog'} />
	<meta name="description" content={displayedPost.ogDescription} />

	<meta property="og:url" content="https://www.alicealexandra.com/blog/{displayedPost.slug}" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Blog - {displayedPost.title || 'Blog'}" />
	<meta property="og:description" content={displayedPost.ogDescription} />
	<meta property="og:image" content={displayedPost.coverImage || 'https://unsplash.it/1200/600'} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@tempoimmaterial" />
	<meta name="twitter:creator" content="@tempoimmaterial" />
	<meta name="twitter:domain" content="alicealexandra.com" />
	<meta name="twitter:url" content="https://www.alicealexandra.com/blog" />
	<meta name="twitter:title" content="Blog - {displayedPost.title || 'Blog'}" />
	<meta name="twitter:description" content={displayedPost.ogDescription} />
	<meta name="twitter:image" content={displayedPost.coverImage || 'https://unsplash.it/1200/600'} />
	<meta
		name="twitter:image:alt"
		content="Open graph representation of this blog article, {displayedPost.title || 'Blog'}."
	/>

	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
		media="(prefers-color-scheme: light)"
	/>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
		media="(prefers-color-scheme: dark)"
	/>
</svelte:head>

<div class="page-wrapper">
	<BlogHeader
		title={displayedPost.title}
		subtitle={displayedPost.subtitle}
		category={displayedPost.category || 'Article'}
		publishedDate={displayedPost.formattedPublicationDate}
		readTime={displayedPost.readTime}
	/>

	<div class="blog-container">
		{#if ownerStatusLoaded && ownerStatus.isOwner}
			<div class="editor-toolbar">
				<div class="editor-toolbar-copy">
					<p class="editor-toolbar-kicker">Owner mode</p>
					<p class="editor-toolbar-text">
						{#if isEditMode}
							Editing <strong>{post.slug}.md</strong> in teenylilcontent.
						{:else}
							Signed in as <strong>{ownerStatus.owner?.name || ownerStatus.owner?.login}</strong>.
						{/if}
					</p>
				</div>
				<div class="editor-toolbar-actions">
					<a class="editor-action secondary" href="/owner">Owner</a>
					{#if isEditMode}
						<button
							class="editor-action secondary"
							type="button"
							on:click={closeEditor}
							disabled={isSaving}
						>
							Cancel
						</button>
						<button
							class="editor-action primary"
							type="button"
							on:click={saveEditor}
							disabled={isSaving}
						>
							{isSaving ? 'Saving…' : 'Save & publish'}
						</button>
					{:else}
						<button
							class="editor-action primary"
							type="button"
							on:click={openEditor}
							disabled={isLoadingEditor}
						>
							{isLoadingEditor ? 'Loading…' : 'Edit'}
						</button>
					{/if}
				</div>
			</div>
		{/if}

		{#if editorError}
			<div class="editor-feedback editor-feedback-error">{editorError}</div>
		{/if}

		{#if editorNotice}
			<div class="editor-feedback editor-feedback-success">
				<span>{editorNotice}</span>
				{#if editorCommitUrl}
					<a href={editorCommitUrl} target="_blank" rel="noreferrer">View commit</a>
				{/if}
			</div>
		{/if}

		{#if isEditMode && editorDraft}
			<div class="editor-layout">
				<form class="editor-pane editor-form" on:submit|preventDefault={saveEditor}>
					<div class="editor-pane-header">
						<h2 class="editor-pane-title">Edit source</h2>
						<p class="editor-pane-copy">
							Use normal markdown punctuation like <code>_</code>, <code>**</code>, headings, lists,
							and fences.
						</p>
					</div>

					<div class="editor-metadata-grid">
						<label class="editor-field editor-field-wide">
							<span class="editor-field-label">Title</span>
							<input bind:value={editorDraft.title} class="editor-input" type="text" />
						</label>
						<label class="editor-field editor-field-wide">
							<span class="editor-field-label">Subtitle</span>
							<input bind:value={editorDraft.subtitle} class="editor-input" type="text" />
						</label>
						<label class="editor-field">
							<span class="editor-field-label">Category</span>
							<input bind:value={editorDraft.category} class="editor-input" type="text" />
						</label>
						<label class="editor-field">
							<span class="editor-field-label">Publication date</span>
							<input bind:value={editorDraft.publicationDate} class="editor-input" type="date" />
						</label>
						<label class="editor-field editor-field-wide">
							<span class="editor-field-label">Formatted publication date</span>
							<input
								bind:value={editorDraft.formattedPublicationDate}
								class="editor-input"
								type="text"
							/>
						</label>
						<label class="editor-field editor-field-wide">
							<span class="editor-field-label">Summary</span>
							<textarea
								bind:value={editorDraft.summary}
								class="editor-textarea editor-meta-textarea"
							></textarea>
						</label>
						<label class="editor-field editor-field-wide">
							<span class="editor-field-label">Open graph description</span>
							<textarea
								bind:value={editorDraft.ogDescription}
								class="editor-textarea editor-meta-textarea"
							></textarea>
						</label>
						<label class="editor-field editor-field-wide">
							<span class="editor-field-label">Cover image URL</span>
							<input bind:value={editorDraft.coverImage} class="editor-input" type="url" />
						</label>
						<label class="editor-field editor-field-wide">
							<span class="editor-field-label">Cover image caption</span>
							<input bind:value={editorDraft.coverImageCaption} class="editor-input" type="text" />
						</label>
					</div>

					<div class="editor-readonly-row">
						<p><span>Slug</span><strong>{editorDraft.slug}</strong></p>
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
							This uses the same renderer and prose styles as the live post.
						</p>
					</div>
					<BlogMarkdownContent
						markdown={editorDraft.content}
						contentClass="prose editor-preview-content"
					/>
				</section>
			</div>
		{:else}
			<BlogMarkdownContent markdown={post.content} />
		{/if}

		<p class="back-link">
			<a href="/blog" data-sveltekit-noscroll>back.</a>
		</p>
	</div>
</div>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		background-color: var(--color-content-bg) !important;
		padding: 0;
		min-height: 100vh;
	}

	.page-wrapper {
		position: relative;
		z-index: 1;
		background-color: var(--color-content-bg);
		min-height: 100vh;
	}

	.blog-container {
		margin: 0 auto;
		background-color: var(--color-content-bg);
		padding: var(--content-space-lg) var(--content-space-sm);
		max-width: 900px;
		color: var(--color-content-text);

		@media (min-width: 640px) {
			padding: var(--content-space-lg) var(--content-space-md);
		}

		@media (min-width: 768px) {
			padding: var(--content-space-lg) var(--content-space-xl);
		}

		@media (min-width: 1280px) {
			padding: var(--content-space-xl) var(--content-space-xl);
			max-width: 1320px;
		}

		@media (min-width: 1536px) {
			padding: var(--content-space-xl) var(--content-space-lg);
		}
	}

	.blog-container > div:not(.prose):not(.editor-layout):not(.editor-toolbar):not(.editor-feedback) {
		margin: 0 auto;
		width: 100%;
		max-width: 900px;
		font-size: var(--content-font-size-body);

		@media (min-width: 1024px) {
			font-size: var(--content-font-size-body-lg);
		}
	}

	.editor-toolbar,
	.editor-feedback {
		margin: 0 auto 1.5rem;
		border: 1px solid var(--color-content-border);
		background: color-mix(in srgb, var(--color-content-bg) 92%, var(--color-content-text) 8%);
		padding: 1rem;
	}

	.editor-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.editor-toolbar-kicker {
		margin: 0 0 0.25rem;
		color: var(--color-content-secondary);
		font-size: var(--content-font-size-body-sm);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.editor-toolbar-text,
	.editor-feedback,
	.editor-pane-copy,
	.editor-field-label,
	.editor-readonly-row {
		font-size: var(--content-font-size-body-sm);
		line-height: 1.5;
	}

	.editor-toolbar-text,
	.editor-pane-copy {
		margin: 0;
	}

	.editor-toolbar-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.editor-action {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		border: 1px solid var(--color-content-border);
		background: transparent;
		padding: 0.7rem 1rem;
		color: var(--color-content-text);
		font: inherit;
		text-decoration: none;
	}

	.editor-action.primary {
		background: var(--color-content-text);
		color: var(--color-content-bg);
	}

	.editor-action:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.editor-feedback {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.editor-feedback a {
		color: inherit;
	}

	.editor-feedback-error {
		border-color: var(--color-content-link);
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

	.preview-pane :global(.editor-preview-content) {
		margin: 0;
		max-width: none;
	}

	.back-link {
		margin-top: 4em;
		width: 100%;
		max-width: var(--content-measure);
		font-size: 2.25rem;
		line-height: 2.5rem;
		text-align: right;

		@media (min-width: 768px) {
			font-size: var(--content-font-size-heading-lg);
			line-height: 1;
		}

		a {
			display: inline-block;
			padding: var(--content-space-md);
			color: var(--color-content-text);
			font-family: var(--font-serif);
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

	@media (min-width: 1280px) {
		.editor-layout {
			grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
			align-items: start;
		}

		.preview-pane {
			position: sticky;
			top: 2rem;
		}
	}

	@media (max-width: 767px) {
		.editor-toolbar,
		.editor-feedback {
			flex-direction: column;
			align-items: flex-start;
		}

		.editor-toolbar-actions {
			width: 100%;
		}

		.editor-action {
			flex: 1 1 auto;
		}
	}
</style>
