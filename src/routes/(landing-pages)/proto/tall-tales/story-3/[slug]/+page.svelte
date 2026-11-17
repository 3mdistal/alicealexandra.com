<!-- Prototype: story 3, "a quiet book". A title page with the cover in an arch, then ink on paper; a section's image appears only as a plate where the image changes. -->
<script lang="ts">
	import '$lib/styles/prose.css';
	import AudioPlayer from '$lib/components/audio-player.svelte';
	import ProtoSwitch from '$lib/prototypes/tall-tales/proto-switch.svelte';
	import { storyLinks } from '$lib/prototypes/tall-tales/links';
	import { BACK_ICON_PATH, coverOf, renderSections } from '$lib/prototypes/tall-tales/story';

	let { data } = $props();
	const tale = $derived(data.tale);
	const cover = $derived(coverOf(data.tale));
	const sections = $derived(
		renderSections(data.tale).map((section, i, all) => {
			const image = section.theme.backgroundImage;
			const previous = i === 0 ? cover : all[i - 1].theme.backgroundImage;
			return { ...section, plate: image && image !== previous ? image : '' };
		})
	);
</script>

<svelte:head>
	<title>{tale.title}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<article class="book">
	<AudioPlayer src={tale.audio?.src} loop={tale.audio?.loop} />

	<header class="title-page">
		<a class="back" href="/studio/tall-tales" aria-label="Tall Tales">
			<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
				<path fill-rule="evenodd" clip-rule="evenodd" d={BACK_ICON_PATH} fill="currentColor" />
			</svg>
		</a>
		<span class="arch" style="--image: url('{cover}')" aria-hidden="true"></span>
		<h1>{tale.title}</h1>
		{#if tale.description}
			<p>{tale.description}</p>
		{/if}
	</header>

	{#each sections as section, i}
		{#if section.plate}
			<div class="plate" style="--image: url('{section.plate}')" aria-hidden="true"></div>
		{:else if i > 0}
			<div class="rule" aria-hidden="true"></div>
		{/if}
		<section class="section">
			<div class="prose text">{@html section.html}</div>
		</section>
	{/each}

	<footer class="end">
		<a class="back" href="/studio/tall-tales" aria-label="Tall Tales">
			<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
				<path fill-rule="evenodd" clip-rule="evenodd" d={BACK_ICON_PATH} fill="currentColor" />
			</svg>
		</a>
	</footer>
</article>

<ProtoSwitch links={storyLinks(tale.slug)} current="3" />

<style>
	.book {
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		background: var(--color-warm-50);
		width: 100vw;
		color: var(--color-gray-850);
		--ink: var(--color-gray-850);
	}

	.title-page {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		padding: 12vh var(--space-6) 10vh;
		min-height: 100vh;
		min-height: 100svh;
		text-align: center;
	}

	.arch {
		display: block;
		filter: saturate(0.85);
		border-radius: 999px 999px 0 0;
		background-image: var(--image);
		background-position: center;
		background-size: cover;
		width: min(58vw, 340px);
		aspect-ratio: 3 / 4;
	}

	.title-page h1 {
		margin: var(--space-7) 0 0;
		color: var(--ink);
		font-weight: var(--font-weight-light);
		font-size: clamp(2.2rem, 6vw, 4.5rem);
		line-height: 1.05;
		font-family: var(--font-serif);
		letter-spacing: 0.06em;
		text-wrap: balance;
	}

	.title-page p {
		opacity: 0.75;
		margin: var(--space-4) auto 0;
		max-width: 32ch;
		font-style: italic;
		font-size: clamp(1.05rem, 1.8vw, 1.3rem);
		font-family: var(--font-serif);
		text-wrap: balance;
	}

	.back {
		display: inline-grid;
		position: absolute;
		top: var(--space-6);
		left: var(--space-6);
		place-items: center;
		opacity: 0.55;
		transition: opacity 0.2s ease;
		border-radius: 50%;
		width: 44px;
		height: 44px;
		color: var(--ink);
	}

	.back:hover,
	.back:focus-visible {
		opacity: 1;
	}

	.plate {
		filter: saturate(0.85);
		margin: 6vh 0 0;
		background-image: var(--image);
		background-position: center;
		background-size: cover;
		height: 46vh;
	}

	.rule {
		margin: 4rem auto 0;
		background: color-mix(in srgb, var(--ink) 35%, transparent);
		width: 48px;
		height: 1px;
	}

	.section {
		display: flex;
		justify-content: center;
		padding: 8vh var(--space-5) 4vh;
	}

	.text {
		width: 100%;
		max-width: 34rem;
		color: var(--ink);
		font-weight: var(--font-weight-regular);
		font-size: 1.2rem;
		line-height: 1.9;
		font-family: var(--font-serif);
	}

	@media (min-width: 1024px) {
		.text {
			font-size: 1.3rem;
		}
	}

	.text :global(p),
	.text :global(em),
	.text :global(strong),
	.text :global(blockquote),
	.text :global(h2),
	.text :global(h3) {
		color: var(--ink) !important;
	}

	.text :global(p::first-letter) {
		color: var(--ink) !important;
	}

	.text :global(p) {
		margin: 0 0 1.2em;
	}

	.text :global(h2) {
		opacity: 0.6;
		margin: 0 0 3rem;
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
		padding: 8vh 0 16vh;
	}

	.end .back {
		position: static;
	}
</style>
