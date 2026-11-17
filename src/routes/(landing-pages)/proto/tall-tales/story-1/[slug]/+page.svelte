<!-- Prototype: story 1, "today's page, refined". Each section keeps its own image and color; a title screen, a serif reading column, and soft hand-offs between sections. -->
<script lang="ts">
	import '$lib/styles/prose.css';
	import AudioPlayer from '$lib/components/audio-player.svelte';
	import ProtoSwitch from '$lib/prototypes/tall-tales/proto-switch.svelte';
	import { storyLinks } from '$lib/prototypes/tall-tales/links';
	import { BACK_ICON_PATH, coverOf, renderSections } from '$lib/prototypes/tall-tales/story';

	let { data } = $props();
	const tale = $derived(data.tale);
	const sections = $derived(renderSections(data.tale));
	const first = $derived(sections[0]?.theme);
</script>

<svelte:head>
	<title>{tale.title}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<article class="tale">
	<AudioPlayer src={tale.audio?.src} loop={tale.audio?.loop} />

	<header
		class="cover"
		style="--bg-image: url('{coverOf(tale)}'); --bg-color: {first?.backgroundColor ??
			'#000'}; --text-color: {first?.textColor ?? '#fff'};"
	>
		<a class="back" href="/studio/tall-tales" aria-label="Tall Tales">
			<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
				<path fill-rule="evenodd" clip-rule="evenodd" d={BACK_ICON_PATH} fill="currentColor" />
			</svg>
		</a>
		<div class="cover-text">
			<h1>{tale.title}</h1>
			{#if tale.description}
				<p>{tale.description}</p>
			{/if}
		</div>
	</header>

	{#each sections as section}
		<section
			class="section"
			style="
				{section.theme.backgroundImage ? `--bg-image: url('${section.theme.backgroundImage}');` : ''}
				--bg-opacity: {section.theme.backgroundImageOpacity ?? 0.4};
				--bg-color: {section.theme.backgroundColor ?? '#0b0b0b'};
				--overlay-color: {section.theme.overlayColor ?? 'rgba(0, 0, 0, 0.6)'};
				--text-color: {section.theme.textColor};
			"
		>
			<div class="prose text">{@html section.html}</div>
		</section>
	{/each}

	<footer class="end" style="--bg-color: {sections.at(-1)?.theme.backgroundColor ?? '#000'};">
		<a class="back" href="/studio/tall-tales" aria-label="Tall Tales">
			<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
				<path fill-rule="evenodd" clip-rule="evenodd" d={BACK_ICON_PATH} fill="currentColor" />
			</svg>
		</a>
	</footer>
</article>

<ProtoSwitch links={storyLinks(tale.slug)} current="1" />

<style>
	.tale {
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		background: var(--color-neutral-1000);
		width: 100vw;
	}

	.cover {
		display: grid;
		position: relative;
		place-items: center;
		background-color: var(--bg-color);
		min-height: 100vh;
		min-height: 100svh;
		overflow: hidden;
		color: var(--text-color);
	}

	.cover::before {
		position: absolute;
		opacity: 0.75;
		inset: 0;
		background-image: var(--bg-image);
		background-position: center;
		background-size: cover;
		content: '';
		-webkit-mask-image: linear-gradient(to bottom, #000 60%, transparent);
		mask-image: linear-gradient(to bottom, #000 60%, transparent);
	}

	.cover-text {
		position: relative;
		padding: 0 var(--space-6);
		max-width: 56rem;
		text-align: center;
	}

	.cover h1 {
		margin: 0;
		color: var(--text-color);
		font-weight: var(--font-weight-light);
		font-size: clamp(2.6rem, 8vw, 6.5rem);
		line-height: 1.02;
		font-family: var(--font-serif);
		letter-spacing: 0.04em;
		text-shadow: 0 4px 30px color-mix(in srgb, var(--color-neutral-1000) 50%, transparent);
		text-wrap: balance;
	}

	.cover p {
		opacity: 0.85;
		margin: var(--space-5) auto 0;
		max-width: 32ch;
		font-style: italic;
		font-size: clamp(1.1rem, 2vw, 1.4rem);
		font-family: var(--font-serif);
		text-wrap: balance;
	}

	.back {
		display: inline-grid;
		position: absolute;
		top: var(--space-6);
		left: var(--space-6);
		place-items: center;
		opacity: 0.6;
		z-index: 2;
		transition: opacity 0.2s ease;
		border-radius: 50%;
		width: 44px;
		height: 44px;
		color: var(--text-color, var(--color-neutral-0));
	}

	.back:hover,
	.back:focus-visible {
		opacity: 1;
	}

	.section {
		display: flex;
		position: relative;
		justify-content: center;
		box-sizing: border-box;
		background-color: var(--bg-color);
		padding: 24vh var(--space-5);
		color: var(--text-color);
	}

	.section::before {
		position: absolute;
		opacity: var(--bg-opacity, 0.4);
		inset: 0;
		background-image: var(--bg-image, none);
		background-position: center;
		background-size: cover;
		background-attachment: fixed;
		content: '';
		-webkit-mask-image: linear-gradient(to bottom, transparent, #000 18vh, #000 calc(100% - 18vh), transparent);
		mask-image: linear-gradient(to bottom, transparent, #000 18vh, #000 calc(100% - 18vh), transparent);
	}

	.section::after {
		position: absolute;
		mix-blend-mode: multiply;
		inset: 0;
		background-color: var(--overlay-color);
		content: '';
	}

	.text {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 36rem;
		color: var(--text-color);
		font-weight: var(--font-weight-regular);
		font-size: 1.2rem;
		line-height: 1.85;
		font-family: var(--font-serif);
	}

	@media (min-width: 1024px) {
		.text {
			font-size: 1.35rem;
		}
	}

	.text :global(p),
	.text :global(em),
	.text :global(strong),
	.text :global(a),
	.text :global(blockquote),
	.text :global(h2),
	.text :global(h3) {
		color: var(--text-color) !important;
	}

	.text :global(p::first-letter) {
		color: var(--text-color) !important;
	}

	.text :global(p) {
		margin: 0 0 1.25em;
	}

	.text :global(h2) {
		opacity: 0.7;
		margin: 0 0 3.5rem;
		font-weight: var(--font-weight-regular);
		font-size: 0.85rem;
		font-family: var(--font-sans);
		letter-spacing: 0.32em;
		text-align: center;
		text-transform: lowercase;
	}

	.end {
		display: grid;
		place-items: center;
		background: var(--bg-color);
		padding: 10vh 0 16vh;
		--text-color: var(--color-neutral-0);
	}

	.end .back {
		position: static;
	}

	@media (max-width: 760px), (hover: none) {
		.section::before {
			background-attachment: scroll;
		}
	}
</style>
