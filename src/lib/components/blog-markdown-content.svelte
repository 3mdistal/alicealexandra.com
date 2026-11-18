<script lang="ts">
	import '$lib/styles/prose.css';
	import { afterUpdate, onMount, tick } from 'svelte';
	import { enhanceInterludeVideos } from '$lib/blog/interlude-videos';
	import type { ImageSize } from '$lib/blog/image-size';
	import { hasCodeBlock, renderBlogMarkdown } from '$lib/blog/render-markdown';
	import lightCodeTheme from 'highlight.js/styles/github.min.css?url';
	import darkCodeTheme from 'highlight.js/styles/github-dark.min.css?url';

	export let markdown = '';
	export let contentClass = 'prose';
	export let emptyText = 'No content available.';
	export let imageSizes: Record<string, ImageSize> = {};

	let context: HTMLElement;
	let cleanupInlineVideos = () => {};

	$: htmlContent = renderBlogMarkdown(markdown, { interludeVideoControls: true, imageSizes });
	// Most posts have no code, so only those that do load the highlighting theme.
	$: showsCode = hasCodeBlock(htmlContent);

	const refreshEnhancements = async () => {
		await tick();
		cleanupInlineVideos();

		if (!context) {
			return;
		}

		cleanupInlineVideos = enhanceInterludeVideos(context);
	};

	onMount(() => {
		void refreshEnhancements();

		return () => {
			cleanupInlineVideos();
		};
	});

	afterUpdate(() => {
		void refreshEnhancements();
	});
</script>

<svelte:head>
	{#if showsCode}
		<link rel="stylesheet" href={lightCodeTheme} media="(prefers-color-scheme: light)" />
		<link rel="stylesheet" href={darkCodeTheme} media="(prefers-color-scheme: dark)" />
	{/if}
</svelte:head>

{#if htmlContent}
	<div class={contentClass} bind:this={context}>
		{@html htmlContent}
	</div>
{:else}
	<p>{emptyText}</p>
{/if}
