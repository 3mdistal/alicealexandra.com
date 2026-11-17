<!-- Prototype: story 2, "a descent". One continuous page over a fixed backdrop: each section's image fades in as you reach it, the water darkens the deeper you read, and a wordless gauge marks the depth. -->
<script lang="ts">
	import '$lib/styles/prose.css';
	import { onMount } from 'svelte';
	import AudioPlayer from '$lib/components/audio-player.svelte';
	import ProtoSwitch from '$lib/prototypes/tall-tales/proto-switch.svelte';
	import { storyLinks } from '$lib/prototypes/tall-tales/links';
	import { BACK_ICON_PATH, renderSections } from '$lib/prototypes/tall-tales/story';

	let { data } = $props();
	const tale = $derived(data.tale);
	const sections = $derived(renderSections(data.tale));

	let article = $state<HTMLElement>();
	let active = $state(0);
	let progress = $state(0);
	let ticks = $state<number[]>([]);

	onMount(() => {
		if (!article) return;
		const sectionEls = Array.from(article.querySelectorAll<HTMLElement>('[data-index]'));

		const measure = () => {
			const scrollable = document.documentElement.scrollHeight - window.innerHeight;
			ticks = sectionEls.map((el) =>
				scrollable > 0
					? Math.min(1, (el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2) / scrollable)
					: 0
			);
		};

		let frame = 0;
		const onScroll = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const scrollable = document.documentElement.scrollHeight - window.innerHeight;
				progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
			});
		};

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						active = Number((entry.target as HTMLElement).dataset.index);
					}
				}
			},
			{ rootMargin: '-45% 0px -45% 0px' }
		);
		for (const el of sectionEls) observer.observe(el);

		measure();
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', measure);
		return () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', measure);
		};
	});
</script>

<svelte:head>
	<title>{tale.title}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="depth" aria-hidden="true">
	{#each sections as section, i}
		<div
			class="layer"
			class:on={i === active}
			style="
				{section.theme.backgroundImage ? `--bg-image: url('${section.theme.backgroundImage}');` : ''}
				--bg-opacity: {section.theme.backgroundImageOpacity ?? 0.4};
				--bg-color: {section.theme.backgroundColor ?? '#0b0b0b'};
				--overlay-color: {section.theme.overlayColor ?? 'rgba(0, 0, 0, 0.6)'};
			"
		></div>
	{/each}
	<div class="water" style="--depth: {progress}"></div>
</div>

<article class="tale" bind:this={article}>
	<AudioPlayer src={tale.audio?.src} loop={tale.audio?.loop} />

	<header class="cover" style="--text-color: {sections[0]?.theme.textColor ?? '#fff'};">
		<a class="back" href="/studio/tall-tales" aria-label="Tall Tales">
			<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
				<path fill-rule="evenodd" clip-rule="evenodd" d={BACK_ICON_PATH} fill="currentColor" />
			</svg>
		</a>
		<h1>{tale.title}</h1>
		{#if tale.description}
			<p>{tale.description}</p>
		{/if}
	</header>

	{#each sections as section, i}
		<section class="section" data-index={i} style="--text-color: {section.theme.textColor};">
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

<div class="gauge" aria-hidden="true">
	<span class="gauge-fill" style="transform: scaleY({progress})"></span>
	{#each ticks as tick}
		<span class="tick" style="top: {tick * 100}%"></span>
	{/each}
</div>

<ProtoSwitch links={storyLinks(tale.slug)} current="2" />

<style>
	.depth {
		position: fixed;
		z-index: 0;
		inset: 0;
		background: var(--color-neutral-1000);
		pointer-events: none;
	}

	.layer {
		position: absolute;
		opacity: 0;
		transition: opacity 1.6s ease;
		inset: 0;
		background-color: var(--bg-color);
	}

	.layer.on {
		opacity: 1;
	}

	.layer::before {
		position: absolute;
		opacity: var(--bg-opacity);
		inset: 0;
		background-image: var(--bg-image, none);
		background-position: center;
		background-size: cover;
		content: '';
	}

	.layer::after {
		position: absolute;
		mix-blend-mode: multiply;
		inset: 0;
		background-color: var(--overlay-color);
		content: '';
	}

	.water {
		position: absolute;
		opacity: calc(0.1 + var(--depth) * 0.6);
		inset: 0;
		background: linear-gradient(to bottom, #04101f, #01060d);
	}

	.tale {
		position: relative;
		right: 50%;
		left: 50%;
		z-index: 1;
		margin-right: -50vw;
		margin-left: -50vw;
		width: 100vw;
	}

	.cover {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		padding: 0 var(--space-6);
		min-height: 100vh;
		min-height: 100svh;
		color: var(--text-color);
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
		justify-content: center;
		padding: 16vh var(--space-5);
		color: var(--text-color);
	}

	.text {
		width: 100%;
		max-width: 36rem;
		color: var(--text-color);
		font-weight: var(--font-weight-regular);
		font-size: 1.2rem;
		line-height: 1.85;
		font-family: var(--font-serif);
		text-shadow: 0 1px 14px color-mix(in srgb, var(--color-neutral-1000) 55%, transparent);
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
		padding: 10vh 0 18vh;
		--text-color: var(--color-neutral-0);
	}

	.end .back {
		position: static;
	}

	.gauge {
		position: fixed;
		top: 30vh;
		left: 18px;
		z-index: 2;
		background: color-mix(in srgb, var(--color-neutral-0) 22%, transparent);
		width: 1px;
		height: 40vh;
		pointer-events: none;
	}

	.gauge-fill {
		position: absolute;
		transform-origin: top;
		inset: 0;
		background: color-mix(in srgb, var(--color-neutral-0) 85%, transparent);
	}

	.tick {
		position: absolute;
		left: -3px;
		background: color-mix(in srgb, var(--color-neutral-0) 60%, transparent);
		width: 7px;
		height: 1px;
	}

	@media (max-width: 760px) {
		.gauge {
			left: 8px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.layer {
			transition: none;
		}
	}
</style>
