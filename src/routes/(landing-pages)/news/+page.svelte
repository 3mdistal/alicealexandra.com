<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { pageState } from '$lib/stores';
	import { marked } from 'marked';
	import {
		STUDIO_NEWS,
		type NewsMainTab,
		type StudioNewsAction,
		type StudioNewsCategory
	} from '$lib/news/updates';
	import { parseChangelogSummaries } from '$lib/news/site-changelog';

	// Read the CHANGELOG.md content
	import changelog from '../../../../CHANGELOG.md?raw';

	const GITHUB_REPO = '3mdistal/alicealexandra.com';

	const MAIN_TABS: Array<{ id: NewsMainTab; label: string }> = [
		{ id: 'about', label: 'About' },
		{ id: 'studio', label: 'Studio' },
		{ id: 'career', label: 'Career' },
		{ id: 'blog', label: 'Blog' },
		{ id: 'site', label: 'Site' }
	];

	const STUDIO_TABS: Array<{ id: 'all' | StudioNewsCategory; label: string }> = [
		{ id: 'all', label: 'All' },
		{ id: 'hfc', label: 'Hymns for Calliope' },
		{ id: 'postcards', label: 'Postcards' }
	];

	const STUDIO_CATEGORY_LABEL: Record<StudioNewsCategory, string> = {
		hfc: 'Hymns for Calliope',
		postcards: 'Postcards'
	};

	let activeTab: NewsMainTab = 'studio';
	let activeStudioFilter: 'all' | StudioNewsCategory = 'all';
	let showFullChangelog = false;

	function getStudioHref(entry: (typeof STUDIO_NEWS)[number]): string | null {
		return entry.href || null;
	}

	function getStudioTitle(entry: (typeof STUDIO_NEWS)[number]): string {
		return entry.title;
	}

	function studioActionLabel(action: StudioNewsAction): string {
		if (action === 'added') return 'Added';
		if (action === 'edited') return 'Edited';
		return 'Removed';
	}

	function linkifyGithubPrRefs(markdown: string): string {
		// Convert "(#123)" → "([#123](https://github.com/<repo>/pull/123))"
		// Keeps the changelog readable in raw markdown while rendering clickable links on /news.
		return markdown.replace(/\(#(\d+)\)/g, (_match, prNumber: string) => {
			return `([#${prNumber}](https://github.com/${GITHUB_REPO}/pull/${prNumber}))`;
		});
	}

	// Parse markdown to HTML
	const changelogHtml = marked.parse(linkifyGithubPrRefs(changelog));

	// Summaries should be plain text (no linkified markdown artifacts).
	// Full changelog rendering below keeps linkification.
	const siteSummaries = parseChangelogSummaries(changelog);

	function isMainTab(value: string | null): value is NewsMainTab {
		return (
			value === 'about' ||
			value === 'studio' ||
			value === 'career' ||
			value === 'blog' ||
			value === 'site'
		);
	}

	function isStudioFilter(value: string | null): value is 'all' | StudioNewsCategory {
		return value === 'all' || value === 'hfc' || value === 'postcards';
	}

	function syncUrlParams() {
		if (typeof window === 'undefined') return;
		const url = new URL(window.location.href);
		url.searchParams.set('tab', activeTab);
		if (activeTab === 'studio') url.searchParams.set('studio', activeStudioFilter);
		else url.searchParams.delete('studio');

		if (activeTab === 'site' && showFullChangelog) url.searchParams.set('site', 'full');
		else url.searchParams.delete('site');
		window.history.replaceState({}, '', url.toString());
	}

	function setActiveTab(tab: NewsMainTab) {
		activeTab = tab;
		if (tab !== 'site') showFullChangelog = false;
		syncUrlParams();
	}

	function setStudioFilter(filter: 'all' | StudioNewsCategory) {
		activeStudioFilter = filter;
		syncUrlParams();
	}

	function formatDate(isoDate: string): string {
		const d = new Date(`${isoDate}T00:00:00`);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(d);
	}

	$: studioEntries =
		activeStudioFilter === 'all'
			? STUDIO_NEWS
			: STUDIO_NEWS.filter((e) => e.category === activeStudioFilter);

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const tab = params.get('tab');
		const studio = params.get('studio');
		const site = params.get('site');

		if (isMainTab(tab)) activeTab = tab;
		if (isStudioFilter(studio)) activeStudioFilter = studio;
		if (activeTab === 'site') showFullChangelog = site === 'full';

		// Normalize (removes invalid params / ensures defaults are reflected)
		syncUrlParams();
	});

	onDestroy(() => {
		pageState.set('home');
	});
</script>

<svelte:head>
	<title>News</title>
	<meta name="description" content="Recent changes and updates to Tempo Immaterial." />
</svelte:head>

<div class="container">
	<h1>News</h1>
	<div class="tabs" role="tablist" aria-label="News sections">
		{#each MAIN_TABS as tab (tab.id)}
			<button
				type="button"
				class="tab-button"
				class:active={activeTab === tab.id}
				role="tab"
				aria-selected={activeTab === tab.id}
				tabindex={activeTab === tab.id ? 0 : -1}
				on:click={() => setActiveTab(tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="panel">
		{#if activeTab === 'studio'}
			<div class="subtabs" role="tablist" aria-label="Studio filters">
				{#each STUDIO_TABS as tab (tab.id)}
					<button
						type="button"
						class="subtab-button"
						class:active={activeStudioFilter === tab.id}
						role="tab"
						aria-selected={activeStudioFilter === tab.id}
						tabindex={activeStudioFilter === tab.id ? 0 : -1}
						on:click={() => setStudioFilter(tab.id)}
					>
						{tab.label}
					</button>
				{/each}
			</div>

			<section class="entries" aria-label="Studio updates">
				{#if studioEntries.length === 0}
					<p class="coming-soon">No Studio updates yet.</p>
				{:else}
					{#each studioEntries as entry (entry.id)}
						{@const href = getStudioHref(entry)}
						{@const title = getStudioTitle(entry)}
						{@const action = entry.action}
						{@const categoryLabel = STUDIO_CATEGORY_LABEL[entry.category]}

						{#if href}
							<a
								class="entry entry--link entry--studio"
								{href}
								aria-label={`${studioActionLabel(action)} • ${categoryLabel}: ${title}`}
							>
								<div class="entry-left">
									<time class="entry-date" datetime={entry.date}>{formatDate(entry.date)}</time>
									<div class="entry-meta" aria-hidden="true">
										<span class="entry-category">{categoryLabel}</span>
										<span class={`pill pill--action pill--${action}`}
											>{studioActionLabel(action)}</span
										>
									</div>
								</div>
								<div class="entry-body">
									<p class="entry-heading">{title}</p>
								</div>
							</a>
						{:else}
							<article class="entry entry--studio">
								<div class="entry-left">
									<time class="entry-date" datetime={entry.date}>{formatDate(entry.date)}</time>
									<div class="entry-meta" aria-hidden="true">
										<span class="entry-category">{categoryLabel}</span>
										<span class={`pill pill--action pill--${action}`}
											>{studioActionLabel(action)}</span
										>
									</div>
								</div>
								<div class="entry-body">
									<p class="entry-heading">{title}</p>
								</div>
							</article>
						{/if}
					{/each}
				{/if}
			</section>
		{:else if activeTab === 'about'}
			<p class="coming-soon">
				Coming soon. (Life events, books, movies, and other personal notes.)
			</p>
		{:else if activeTab === 'career'}
			<p class="coming-soon">Coming soon.</p>
		{:else if activeTab === 'blog'}
			<p class="coming-soon">Coming soon. (New posts and updates.)</p>
		{:else if activeTab === 'site'}
			<section class="entries" aria-label="Site updates">
				{#if siteSummaries.length === 0}
					<p class="coming-soon">No site updates yet.</p>
				{:else}
					{#each siteSummaries as item (item.id)}
						<article class="entry">
							<time class="entry-date" datetime={item.dateIso}>{formatDate(item.dateIso)}</time>
							<div class="entry-text">
								{#if item.summary}
									<p class="entry-text-line">{item.summary}</p>
								{/if}
								{#if item.items.length > 0}
									<ul class="entry-bullets">
										{#each item.items as bullet (bullet)}
											<li>{@html bullet}</li>
										{/each}
									</ul>
								{/if}
							</div>
						</article>
					{/each}
				{/if}
			</section>

			<div class="site-actions">
				<button
					type="button"
					class="toggle-full"
					aria-expanded={showFullChangelog}
					on:click={() => {
						showFullChangelog = !showFullChangelog;
						syncUrlParams();
					}}
				>
					{showFullChangelog ? 'Hide full changelog' : 'View full changelog'}
				</button>
			</div>

			{#if showFullChangelog}
				<div class="changelog-content">
					{@html changelogHtml}
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #eeeded;
		padding: 6rem 1rem 8rem;
		min-height: 100lvh;
	}

	h1 {
		margin-bottom: 2.5rem;
		color: #726a12;
		font-weight: 500;
		font-size: 3.5rem;
		letter-spacing: -0.02em;
		text-align: center;
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin: 0 auto 2rem;
		width: 100%;
		max-width: 800px;
	}

	.tab-button {
		transition: all 0.2s ease;
		cursor: pointer;
		border: 1px solid rgba(114, 106, 18, 0.25);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(8px);
		padding: 0.6rem 1rem;
		color: #4b460d;
		font-weight: 500;
		letter-spacing: 0.01em;

		&:hover {
			filter: brightness(0.95);
			transform: translateY(-1px);
			box-shadow: 0 4px 12px rgba(114, 106, 18, 0.08);
		}
	}

	.tab-button.active {
		border-color: rgba(114, 106, 18, 0.5);
		background: rgba(114, 106, 18, 0.12);
		color: #3d390b;
	}

	.tab-button:focus-visible {
		outline: 2px solid rgba(114, 106, 18, 0.7);
		outline-offset: 2px;
	}

	.panel {
		margin: 0 auto;
		width: 100%;
		max-width: 800px;
	}

	.subtabs {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin: 0 0 1.5rem;
	}

	.subtab-button {
		transition: filter 0.15s ease;
		cursor: pointer;
		border: 1px solid rgba(114, 106, 18, 0.18);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.55);
		padding: 0.4rem 0.65rem;
		color: rgba(75, 70, 13, 0.95);
		font-weight: 450;

		&:hover {
			filter: brightness(0.9);
		}
	}

	.subtab-button.active {
		border-color: rgba(114, 106, 18, 0.45);
		background: rgba(114, 106, 18, 0.1);
	}

	.entries {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.entry {
		display: grid;
		grid-template-columns: 140px 1fr;
		gap: 1.25rem;
		border: 1px solid rgba(114, 106, 18, 0.12);
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.6);
		padding: 1.25rem;
		transition: all 0.2s ease;
	}

	.entry--studio {
		grid-template-columns: 160px 1fr;
		align-items: start;
	}

	.entry--link {
		transition:
			background 160ms ease,
			border-color 160ms ease,
			transform 160ms ease,
			box-shadow 160ms ease;
		cursor: pointer;
		color: inherit;
		text-decoration: none;
	}

	/* hover affordance without “link styling” */
	.entry--link.entry--studio {
		position: relative;
		/* leave room for the hover chevron */
		padding-right: 2.5rem;
	}

	.entry--link.entry--studio::after {
		position: absolute;
		top: 50%;
		right: 0.9rem;
		transform: translateY(-50%) translateX(-4px);
		opacity: 0;
		transition:
			opacity 160ms ease,
			transform 160ms ease,
			color 160ms ease;
		pointer-events: none;
		content: '→';
		color: rgba(75, 70, 13, 0.55);
		font-size: 1.25rem;
	}

	.entry--link:hover {
		transform: translateY(-2px);
		filter: none;
		box-shadow: 0 12px 24px rgba(18, 16, 0, 0.06);
		border-color: rgba(114, 106, 18, 0.25);
		background: rgba(255, 255, 255, 0.85);
	}

	.entry--link.entry--studio:hover::after {
		transform: translateY(-50%) translateX(0);
		opacity: 1;
		color: rgba(75, 70, 13, 0.75);
	}

	.entry--link:focus-visible {
		outline: 2px solid rgba(114, 106, 18, 0.7);
		outline-offset: 3px;
	}

	.entry--link.entry--studio:focus-visible::after {
		transform: translateY(-50%) translateX(0);
		opacity: 1;
		color: rgba(75, 70, 13, 0.75);
	}

	.entry-date {
		color: rgba(75, 70, 13, 0.7);
		font-size: 0.95rem;
	}

	.entry-left {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Used by the Site tab summary layout */
	.entry-text {
		line-height: 1.65;
	}

	.entry-body {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 0;
	}

	/* Studio cards: center the title vertically against the left meta column */
	.entry--studio .entry-body {
		align-self: center;
	}

	.entry-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.35rem;
	}

	.entry-category {
		color: rgba(75, 70, 13, 0.78);
		font-weight: 600;
		font-size: 0.92rem;
		line-height: 1.2;
		letter-spacing: 0.01em;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		border: 1px solid rgba(114, 106, 18, 0.16);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.55);
		padding: 0.18rem 0.5rem;
		color: rgba(75, 70, 13, 0.82);
		font-size: 0.78rem;
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	.pill--action {
		font-weight: 600;
	}

	.pill--added {
		border-color: rgba(46, 125, 50, 0.22);
		background: rgba(46, 125, 50, 0.08);
		color: rgba(46, 90, 45, 0.95);
	}

	.pill--edited {
		border-color: rgba(25, 118, 210, 0.22);
		background: rgba(25, 118, 210, 0.08);
		color: rgba(18, 74, 132, 0.95);
	}

	.pill--removed {
		border-color: rgba(211, 47, 47, 0.22);
		background: rgba(211, 47, 47, 0.08);
		color: rgba(132, 21, 21, 0.95);
	}

	.entry-heading {
		margin: 0;
		color: rgba(25, 30, 40, 0.92);
		font-weight: 500;
		font-size: 1.45rem;
		line-height: 1.35;
		font-family: 'Spectral', serif;
		word-break: break-word;
	}

	.entry-text-line {
		margin: 0;
	}

	.entry-bullets {
		margin: 0.35rem 0 0;
		padding-left: 1.25rem;
		list-style-type: disc;
	}

	.entry-bullets li {
		margin: 0.25rem 0;
	}

	/* Inline code in the Site tab cards (generated from `parseChangelogSummaries`) */
	.entry-text :global(code) {
		border-radius: 4px;
		background-color: rgba(31, 41, 55, 0.08);
		padding: 0.12rem 0.3rem;
		font-size: 0.95em;
		font-family: 'Cutive Mono', 'Courier New', Courier, monospace;
		word-break: break-word;
	}

	.entry-title {
		font-style: italic;
	}

	.coming-soon {
		margin: 2rem 0;
		padding: 2rem;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.3);
		color: rgba(75, 70, 13, 0.75);
		line-height: 1.6;
		text-align: center;
		font-style: italic;
	}

	.changelog-content {
		margin: 0 auto;
		width: 100%;
		max-width: 800px;
		line-height: 1.6;
	}

	.changelog-content :global(h2) {
		margin-top: 2rem;
		margin-bottom: 1rem;
		color: #726a12;
	}

	.changelog-content :global(ul) {
		margin-bottom: 1.5rem;
		margin-left: 1.5rem;
		list-style-type: disc;
	}

	.changelog-content :global(li) {
		margin-bottom: 0.5rem;
	}

	.changelog-content :global(p) {
		margin-bottom: 1rem;
	}

	/* Markdown code styling (CHANGELOG.md renders via `marked` → <code>/<pre>) */
	.changelog-content :global(code) {
		border-radius: 4px;
		background-color: rgba(31, 41, 55, 0.08);
		padding: 0.15rem 0.35rem;
		font-size: 0.95em;
		font-family: 'Cutive Mono', 'Courier New', Courier, monospace;
		word-break: break-word;
	}

	.changelog-content :global(pre) {
		margin: 1rem 0 1.5rem;
		border-radius: 10px;
		background-color: rgba(31, 41, 55, 0.08);
		padding: 1rem;
		overflow-x: auto;
	}

	.changelog-content :global(pre code) {
		border-radius: 0;
		background: none;
		padding: 0;
		font-size: 0.95em;
		white-space: pre;
		word-break: normal;
	}

	.site-actions {
		margin: 1rem 0 0;
	}

	.toggle-full {
		cursor: pointer;
		border: none;
		background: transparent;
		padding: 0;
		color: rgba(75, 70, 13, 0.95);
		font-weight: 500;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@media (max-width: 640px) {
		.entry {
			grid-template-columns: 1fr;
			gap: 0.25rem;
		}

		.entry--studio {
			gap: 0.6rem;
		}
	}
</style>
