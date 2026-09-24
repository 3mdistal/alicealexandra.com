<script lang="ts">
	import '$lib/styles/prose.css';
	import { marked } from 'marked';
	import AudioPlayer from '$lib/components/audio-player.svelte';
	import LinkButton from '$lib/components/ui/link-button.svelte';
	import WritingEditorShell from '$lib/components/writing-editor-shell.svelte';
	import {
		buildTallTaleSections,
		type TallTale,
		type TallTaleFrontmatter
	} from '$lib/content/tall-tales';
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

	type EditableTallTaleResponse = {
		frontmatter: TallTaleFrontmatter;
		content: string;
		checksum: string;
	};

	type EditorDraft = TallTaleFrontmatter & {
		content: string;
		audio: {
			src: string;
			loop?: boolean;
		};
	};

	type SaveTallTaleResponse = {
		commitSha: string;
		commitUrl: string;
		checksum: string;
		lastEditedTime: string;
	};

	export let data: { tale: TallTale };

	let tale: TallTale = data.tale;
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

	$: displayedTale =
		!isEditMode || !editorDraft
			? tale
			: {
					...tale,
					title: editorDraft.title,
					description: editorDraft.description,
					coverImage: editorDraft.heroImage,
					...(editorDraft.audio.src ? { audio: editorDraft.audio } : {}),
					sections: buildTallTaleSections(editorDraft, editorDraft.content)
				};
	$: sectionsHTML =
		displayedTale?.sections.map((section) => ({
			...section,
			htmlContent: marked.parse(section.content)
		})) || [];

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
			const response = await fetch(`/api/content/writing/tall-tales/${tale.slug}`);
			if (!response.ok) {
				const failure = (await response.json().catch(() => null)) as { message?: string } | null;
				throw new Error(failure?.message ?? 'Failed to load editable tall tale source.');
			}

			const editableTallTale = (await response.json()) as EditableTallTaleResponse;
			editorDraft = {
				...editableTallTale.frontmatter,
				content: editableTallTale.content,
				audio: editableTallTale.frontmatter.audio ?? { src: '', loop: false }
			};
			editorChecksum = editableTallTale.checksum;
			isEditMode = true;
			replaceEditQuery(true);
		} catch (caughtError) {
			editorError =
				caughtError instanceof Error ? caughtError.message : 'Failed to open the tall tale editor.';
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
			const response = await fetch(`/api/content/writing/tall-tales/${tale.slug}/save`, {
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
						notionId: editorDraft.notionId,
						sectionDivider: editorDraft.sectionDivider,
						...(editorDraft.audio.src ? { audio: editorDraft.audio } : {}),
						sections: editorDraft.sections
					},
					content: editorDraft.content,
					originalChecksum: editorChecksum
				})
			});

			if (!response.ok) {
				const failure = (await response.json().catch(() => null)) as { message?: string } | null;
				throw new Error(failure?.message ?? 'Failed to save tall tale.');
			}

			const saveResult = (await response.json()) as SaveTallTaleResponse;
			editorDraft = {
				...editorDraft,
				lastEditedTime: saveResult.lastEditedTime
			};
			tale = {
				...tale,
				title: editorDraft.title,
				description: editorDraft.description,
				coverImage: editorDraft.heroImage,
				...(editorDraft.audio.src ? { audio: editorDraft.audio } : {}),
				sections: buildTallTaleSections(editorDraft, editorDraft.content)
			};
			editorChecksum = saveResult.checksum;
			editorCommitUrl = saveResult.commitUrl;
			editorNotice =
				'Saved to teenylilcontent. Your existing site deploy should publish it automatically.';
		} catch (caughtError) {
			editorError =
				caughtError instanceof Error ? caughtError.message : 'Failed to save tall tale.';
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
	<title>{displayedTale?.title || 'Tall Tale'}</title>
	<meta name="description" content={displayedTale?.description} />
	<meta name="og:title" content={displayedTale?.title || 'Tall Tale'} />
	<meta name="og:description" content={displayedTale?.description} />
	{#if displayedTale?.coverImage}
		<meta name="og:image" content={displayedTale.coverImage} />
	{/if}
</svelte:head>

<div class="tall-tale-wrapper">
	{#if ownerStatusLoaded && ownerStatus.isOwner}
		<div class="editor-host">
			<WritingEditorShell
				ownerName={ownerStatus.owner?.name || ownerStatus.owner?.login || 'owner'}
				fileLabel={`${tale.slug}.md`}
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

			{#if isEditMode && editorDraft}
				<div class="editor-layout">
					<form class="editor-pane editor-form" on:submit|preventDefault={saveEditor}>
						<div class="editor-pane-header">
							<h2 class="editor-pane-title">Edit source</h2>
							<p class="editor-pane-copy">
								Edit the tall tale metadata, section themes, and markdown body together.
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
								<span class="editor-field-label">Cover image URL</span>
								<input bind:value={editorDraft.heroImage} class="editor-input" type="url" />
							</label>
							<label class="editor-field">
								<span class="editor-field-label">Section divider</span>
								<select bind:value={editorDraft.sectionDivider} class="editor-input">
									<option value="hr">Horizontal rule (---)</option>
									<option value="heading">Heading (##)</option>
								</select>
							</label>
							<label class="editor-field editor-field-wide">
								<span class="editor-field-label">Audio URL</span>
								<input bind:value={editorDraft.audio.src} class="editor-input" type="url" />
							</label>
							<label class="editor-field editor-checkbox-field">
								<span class="editor-field-label">Loop audio</span>
								<input
									bind:checked={editorDraft.audio.loop}
									class="editor-checkbox"
									type="checkbox"
								/>
							</label>
						</div>

						<div class="editor-readonly-row editor-readonly-row-wide">
							<p><span>Slug</span><strong>{editorDraft.slug}</strong></p>
							<p><span>Last edited</span><strong>{editorDraft.lastEditedTime || '—'}</strong></p>
							<p><span>Notion ID</span><strong>{editorDraft.notionId}</strong></p>
						</div>

						<div class="editor-sections-grid">
							<div class="editor-section-list">
								<h3 class="editor-subtitle">Section themes</h3>
								{#each editorDraft.sections as section, index}
									<div class="editor-section-card">
										<p class="editor-section-kicker">Section {index + 1}</p>
										<div class="editor-section-fields">
											<label class="editor-field editor-field-wide">
												<span class="editor-field-label">Background image URL</span>
												<input
													bind:value={section.backgroundImage}
													class="editor-input"
													type="url"
												/>
											</label>
											<label class="editor-field">
												<span class="editor-field-label">Text color</span>
												<input bind:value={section.textColor} class="editor-input" type="text" />
											</label>
											<label class="editor-field">
												<span class="editor-field-label">Background opacity</span>
												<input
													bind:value={section.backgroundImageOpacity}
													class="editor-input"
													type="number"
													min="0"
													max="1"
													step="0.05"
												/>
											</label>
											<label class="editor-field">
												<span class="editor-field-label">Background color</span>
												<input
													bind:value={section.backgroundColor}
													class="editor-input"
													type="text"
												/>
											</label>
											<label class="editor-field">
												<span class="editor-field-label">Overlay color</span>
												<input bind:value={section.overlayColor} class="editor-input" type="text" />
											</label>
											<label class="editor-field editor-field-wide">
												<span class="editor-field-label">Font family</span>
												<input bind:value={section.fontFamily} class="editor-input" type="text" />
											</label>
										</div>
									</div>
								{/each}
							</div>

							<label class="editor-field editor-markdown-field">
								<span class="editor-field-label">Markdown source</span>
								<textarea
									bind:value={editorDraft.content}
									class="editor-textarea editor-markdown-input"></textarea>
							</label>
						</div>
					</form>

					<section class="editor-pane preview-pane">
						<div class="editor-pane-header">
							<h2 class="editor-pane-title">Live preview</h2>
							<p class="editor-pane-copy">
								This preview uses the same section rendering and prose styles as the live story.
							</p>
						</div>
						<div class="editor-preview-scroll-region">
							<div class="editor-preview-story">
								{#each sectionsHTML as section, index}
									<section
										class="tall-tale-section editor-preview-tall-tale-section"
										style="
											{section.theme.backgroundImage ? `--bg-image: url('${section.theme.backgroundImage}');` : ''}
											--bg-opacity: {section.theme.backgroundImageOpacity ?? 0.4};
											--bg-color: {section.theme.backgroundColor ?? 'transparent'};
											--overlay-color: {section.theme.overlayColor ?? 'rgba(0, 0, 0, 0.6)'};
											--text-color: {section.theme.textColor};
											--font-family: {section.theme.fontFamily ?? 'var(--font-sans)'};
										"
									>
										<div class="section-content prose">
											{#if index === 0}
												<header class="tale-hero">
													<h2 class="tale-title">{displayedTale.title}</h2>
													{#if displayedTale.description}
														<p class="tale-description">{displayedTale.description}</p>
													{/if}
												</header>
											{/if}
											{@html section.htmlContent}
										</div>
									</section>
								{/each}
							</div>
						</div>
					</section>
				</div>
			{/if}
		</div>
	{/if}

	{#if !isEditMode}
		{#if displayedTale}
			<AudioPlayer src={displayedTale.audio?.src} loop={displayedTale.audio?.loop} />
			{#each sectionsHTML as section, index}
				<section
					class="tall-tale-section parallax"
					style="
						{section.theme.backgroundImage ? `--bg-image: url('${section.theme.backgroundImage}');` : ''}
						--bg-opacity: {section.theme.backgroundImageOpacity ?? 0.4};
						--bg-color: {section.theme.backgroundColor ?? 'transparent'};
						--overlay-color: {section.theme.overlayColor ?? 'rgba(0, 0, 0, 0.6)'};
						--text-color: {section.theme.textColor};
						--font-family: {section.theme.fontFamily ?? 'var(--font-sans)'};
					"
				>
					<div class="section-content prose">
						{#if index === 0}
							<header class="tale-hero">
								<nav class="tale-breadcrumb">
									<a href="/studio/tall-tales" class="tale-breadcrumb-link">
										<svg class="tale-back-icon" viewBox="0 0 16 16" width="16" height="16">
											<path
												fill-rule="evenodd"
												clip-rule="evenodd"
												d="M6.46966 13.7803L6.99999 14.3107L8.06065 13.25L7.53032 12.7197L3.56065 8.75001H14.25H15V7.25001H14.25H3.56065L7.53032 3.28034L8.06065 2.75001L6.99999 1.68935L6.46966 2.21968L1.39644 7.2929C1.00592 7.68342 1.00592 8.31659 1.39644 8.70711L6.46966 13.7803Z"
												fill="currentColor"
											/>
										</svg>
										<span>Tall Tales</span>
									</a>
								</nav>
								<h1 class="tale-title">{displayedTale.title}</h1>
								{#if displayedTale.description}
									<p class="tale-description">{displayedTale.description}</p>
								{/if}
							</header>
						{/if}
						{@html section.htmlContent}
					</div>
				</section>
			{/each}
		{:else}
			<div class="not-found">
				<h1>Story not found</h1>
				<LinkButton href="/studio/tall-tales" variant="solid" size="md"
					>← Back to Stories</LinkButton
				>
			</div>
		{/if}
	{/if}
</div>

<style>
	.tall-tale-wrapper {
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		background: var(--color-bg);
		width: 100vw;
	}

	.editor-host {
		margin: 0 auto;
		padding: 8rem var(--space-6) 3rem;
		max-width: 1440px;
	}

	.tall-tale-section {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		background-color: var(--bg-color, transparent);
		padding: var(--space-9) var(--space-6);
		min-height: 100vh;
		overflow: hidden;
		color: var(--text-color, var(--color-neutral-0));
	}

	.preview-pane {
		display: flex;
		flex-direction: column;
	}

	.editor-preview-tall-tale-section {
		min-height: 40rem;
	}

	.tall-tale-section::before {
		position: absolute;
		opacity: var(--bg-opacity, 0.4);
		z-index: 0;
		inset: 0;
		background-image: var(--bg-image);
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		content: '';
	}

	.tall-tale-section::after {
		position: absolute;
		z-index: 1;
		mix-blend-mode: multiply;
		inset: 0;
		background-color: var(--overlay-color, rgba(0, 0, 0, 0.6));
		content: '';
	}

	.tall-tale-section.parallax::before {
		background-attachment: fixed;
	}

	.section-content {
		position: relative;
		z-index: 2;
		width: 100%;
		max-width: 770px;
		color: var(--text-color);
		font-weight: var(--font-weight-light);
		font-size: var(--content-font-size-body);
		line-height: 1.75rem;
		font-family: var(--font-family);
		text-shadow: none;
	}

	@media (min-width: 1024px) {
		.section-content {
			font-size: var(--content-font-size-body-lg);
			line-height: 2rem;
		}
	}

	.section-content :global(p),
	.section-content :global(li),
	.section-content :global(h1),
	.section-content :global(h2),
	.section-content :global(h3),
	.section-content :global(a),
	.section-content :global(strong),
	.section-content :global(em),
	.section-content :global(blockquote) {
		color: var(--text-color) !important;
	}

	.section-content :global(p::first-letter) {
		color: var(--text-color) !important;
	}

	.section-content :global(p) {
		margin-bottom: var(--space-5);
	}

	.tale-breadcrumb {
		display: inline-flex;
		align-items: center;
		margin-bottom: var(--space-4);
	}

	.tale-breadcrumb-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		opacity: 0.7;
		transition: opacity 0.2s;
		color: var(--text-color);
		font-weight: 500;
		font-size: var(--content-font-size-body-sm);
		text-decoration: none;
	}

	.tale-breadcrumb-link:hover {
		opacity: 1;
		text-decoration: underline;
	}

	.tale-back-icon {
		width: 16px;
		min-width: 16px;
		height: 16px;
		color: currentColor;
	}

	.tale-hero {
		margin-bottom: var(--space-8);
		border-bottom: 1px solid color-mix(in srgb, var(--text-color) 20%, transparent);
		padding-bottom: var(--space-6);
		text-align: left;
	}

	.tale-title {
		margin: 0 0 var(--content-space-sm) 0;
		color: var(--text-color);
		font-weight: 500;
		font-size: 2.25rem;
		line-height: 2.5rem;
	}

	@media (min-width: 640px) {
		.tale-title {
			font-size: 3rem;
			line-height: 1;
		}
	}

	@media (min-width: 768px) {
		.tale-title {
			font-size: var(--content-font-size-heading-lg);
			line-height: 1;
		}
	}

	@media (min-width: 1024px) {
		.tale-title {
			font-size: 4.5rem;
			line-height: 1;
		}
	}

	.tale-description {
		opacity: 0.85;
		margin: 0 0 var(--content-space-lg) 0;
		max-width: var(--content-measure-subtitle);
		color: var(--text-color);
		font-style: italic;
		font-size: var(--content-font-size-body);
		line-height: 1.75rem;
		text-wrap: balance;
	}

	@media (min-width: 768px) {
		.tale-description {
			font-size: var(--content-font-size-body-lg);
			line-height: 2.25rem;
		}
	}

	.editor-layout {
		display: grid;
		gap: 1.5rem;
		margin-top: 1.5rem;
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

	.editor-metadata-grid,
	.editor-section-fields,
	.editor-sections-grid {
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

	.editor-section-list {
		display: grid;
		gap: 1rem;
	}

	.editor-subtitle {
		margin: 0;
		color: var(--color-content-text);
		font-size: 1.1rem;
		font-family: var(--font-serif);
	}

	.editor-section-card {
		border: 1px solid var(--color-content-border);
		background: color-mix(in srgb, var(--color-content-bg) 96%, var(--color-content-text) 4%);
		padding: 1rem;
	}

	.editor-section-kicker {
		margin: 0 0 0.75rem;
		color: var(--color-content-secondary);
		font-size: var(--content-font-size-body-sm);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.editor-markdown-input {
		min-height: 28rem;
		resize: vertical;
		font-size: 0.95rem;
		line-height: 1.7;
		font-family:
			'SFMono-Regular', 'SFMono-Regular Fallback', ui-monospace, 'Cascadia Code', 'Roboto Mono',
			Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
	}

	.editor-preview-scroll-region {
		padding-right: 0.35rem;
		min-height: 32rem;
		max-height: 70vh;
		overflow: auto;
	}

	.editor-preview-story {
		display: grid;
		gap: 1rem;
	}

	.not-found {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--space-4);
		min-height: 100vh;
		color: var(--color-text);
	}

	@media (min-width: 768px) {
		.editor-metadata-grid,
		.editor-section-fields {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1280px) {
		.editor-layout {
			grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
			align-items: start;
		}

		.editor-sections-grid {
			grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);
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
