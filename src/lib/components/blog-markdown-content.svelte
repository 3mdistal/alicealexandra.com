<script lang="ts">
	import '$lib/styles/prose.css';
	import { afterUpdate, onMount, tick } from 'svelte';
	import { createTOC, subAndSuper } from '$lib/notion/utils/blog-helpers';
	import { renderBlogMarkdown } from '$lib/blog/render-markdown';

	export let markdown = '';
	export let contentClass = 'prose';
	export let emptyText = 'No content available.';

	let context: HTMLElement;
	let cleanupInlineVideos = () => {};

	$: htmlContent = renderBlogMarkdown(markdown);

	const setupInlineVideos = () => {
		if (!context || typeof IntersectionObserver === 'undefined') {
			return () => {};
		}

		const videos = Array.from(
			context.querySelectorAll<HTMLVideoElement>('.session-interlude-video')
		);

		if (!videos.length) {
			return () => {};
		}

		videos.forEach((video) => {
			video.controls = false;
			video.muted = true;
			video.loop = true;
			video.playsInline = true;
		});

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const video = entry.target as HTMLVideoElement;

					if (entry.isIntersecting) {
						void video.play().catch(() => {});
						return;
					}

					video.pause();
				});
			},
			{ threshold: 0.5 }
		);

		videos.forEach((video) => observer.observe(video));

		return () => {
			observer.disconnect();
			videos.forEach((video) => video.pause());
		};
	};

	const refreshEnhancements = async () => {
		await tick();
		cleanupInlineVideos();

		if (!context) {
			return;
		}

		subAndSuper(context);
		createTOC();
		cleanupInlineVideos = setupInlineVideos();
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
