<script lang="ts">
	import '$lib/styles/prose.css';
	import { afterUpdate, onMount, tick } from 'svelte';
	import { createTOC, subAndSuper } from '$lib/notion/utils/blog-helpers';
	import { enhanceInterludeVideos } from '$lib/blog/interlude-videos';
	import { renderBlogMarkdown } from '$lib/blog/render-markdown';

	export let markdown = '';
	export let contentClass = 'prose';
	export let emptyText = 'No content available.';

	let context: HTMLElement;
	let cleanupInlineVideos = () => {};

	$: htmlContent = renderBlogMarkdown(markdown, { interludeVideoControls: true });

	const refreshEnhancements = async () => {
		await tick();
		cleanupInlineVideos();

		if (!context) {
			return;
		}

		subAndSuper(context);
		createTOC();
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

{#if htmlContent}
	<div class={contentClass} bind:this={context}>
		{@html htmlContent}
	</div>
{:else}
	<p>{emptyText}</p>
{/if}
