<script lang="ts">
	import '$lib/styles/prose.css';
	import { marked } from 'marked';
	import AudioPlayer from '$lib/components/audio-player.svelte';
	import LinkButton from '$lib/components/ui/link-button.svelte';

	let { data } = $props();
	const tale = $derived(data.tale);

	const sectionsHTML = $derived(
		tale?.sections.map((s: any) => ({
			...s,
			htmlContent: marked.parse(s.content)
		})) || []
	);
</script>

<svelte:head>
	<title>{tale?.title || 'Tall Tale'}</title>
	<meta name="description" content={tale?.description} />
	<meta name="og:title" content={tale?.title || 'Tall Tale'} />
	<meta name="og:description" content={tale?.description} />
	{#if tale?.coverImage}
		<meta name="og:image" content={tale.coverImage} />
	{/if}
</svelte:head>

<div class="tall-tale-wrapper">
	{#if tale}
		<AudioPlayer src={tale.audio?.src} loop={tale.audio?.loop} />
		{#each sectionsHTML as section}
			<section
				class="tall-tale-section parallax"
				style="
					--bg-image: url('{section.theme.backgroundImage}');
					--bg-opacity: {section.theme.backgroundImageOpacity ?? 0.4};
					--bg-color: {section.theme.backgroundColor ?? 'transparent'};
					--overlay-color: {section.theme.overlayColor ?? 'rgba(0, 0, 0, 0.6)'};
					--text-color: {section.theme.textColor};
					--font-family: {section.theme.fontFamily ?? 'var(--font-serif)'};
				"
			>
				<div class="section-content prose" style="font-family: var(--font-family);">
					{@html section.htmlContent}
				</div>
			</section>
		{/each}
	{:else}
		<div class="not-found">
			<h1>Story not found</h1>
			<LinkButton href="/studio/tall-tales" variant="solid" size="md">← Back to Stories</LinkButton>
		</div>
	{/if}
</div>

<style>
	.tall-tale-wrapper {
		/* Reset margin from main layouts if necessary */
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		background: var(--color-bg);
		width: 100vw;
	}

	.tall-tale-section {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		padding: var(--space-9) var(--space-6);
		min-height: 100vh;
		overflow: hidden;
		color: var(--text-color, var(--color-neutral-0));
		background-color: var(--bg-color, transparent);
	}

	.tall-tale-section::before {
		position: absolute;
		inset: 0;
		opacity: var(--bg-opacity, 0.4);
		z-index: -2;
		background-image: var(--bg-image);
		background-position: center;
		background-size: cover;
		content: '';
	}

	.tall-tale-section::after {
		position: absolute;
		inset: 0;
		z-index: -1;
		mix-blend-mode: multiply;
		background-color: var(--overlay-color, rgba(0, 0, 0, 0.6));
		content: '';
	}

	.tall-tale-section.parallax::before {
		background-attachment: fixed;
	}

	.section-content {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 700px;
		font-size: var(--font-size-lg);
		line-height: var(--line-height-body);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	}

	.section-content :global(p) {
		margin-bottom: var(--space-5);
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
</style>
