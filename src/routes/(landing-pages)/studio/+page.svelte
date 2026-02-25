<script lang="ts">
	import { onDestroy } from 'svelte';
	import StudioCard from './studio-card.svelte';
	import OptimizedImage from '$lib/components/ui/optimized-image.svelte';
	import gsap from 'gsap';
	import { pageState } from '$lib/stores';
	import type { StudioCard as StudioCardType } from '$lib/content/studio';

	export let data;

	const cards: StudioCardType[] = data.cards ?? [];

	function populate(_node: HTMLElement) {
		const cssOpacity = getComputedStyle(_node).getPropertyValue('--ink-target-opacity').trim();
		const targetOpacity = Number.parseFloat(cssOpacity);
		const finalOpacity = Number.isFinite(targetOpacity) ? targetOpacity : 0.4;

		const tl = gsap.timeline();
		tl.to('.card-div', { opacity: 1, duration: 0.5 })
			.fromTo(
				'.studio-background',
				{ opacity: 0 },
				{ opacity: 1, duration: 0.4, ease: 'power2.inOut' }
			)
			.to('.studio-background', { opacity: finalOpacity, duration: 0.8, ease: 'power2.inOut' })
			.fromTo('.card-div > *', { opacity: 0 }, { opacity: 1, stagger: 0.1 }, '<');

		return {
			destroy() {
				tl.kill();
			}
		};
	}

	onDestroy(() => {
		pageState.set('home');
	});
</script>

<svelte:head>
	<title>Studio</title>
	<meta
		property="description"
		content="The studio works of Alice Alexandra Moore. Enjoy fiction, film, fantasy, poetry, illustrations, music, essays, websites, and more."
	/>
	<meta
		property="keywords"
		content="alice, alexandra, moore, alice alexandra moore, alice moore, alexandra moore, studio, fiction, film, fantasy, poetry, illustrations, music, essays, websites"
	/>

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content="https://www.alicealexandra.com/studio" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Studio" />
	<meta
		property="og:description"
		content="The studio works of Alice Alexandra Moore. Enjoy fiction, film, fantasy, poetry, illustrations, music, essays, websites, and more."
	/>
	<meta property="og:image" content="https://pub-a1233e2ec22b407fb8ef2b8a06521728.r2.dev/studio/studioog.jpg" />

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@tempoimmaterial" />
	<meta name="twitter:creator" content="@tempoimmaterial" />
	<meta name="twitter:domain" content="alicealexandra.com/studio" />
	<meta name="twitter:url" content="https://www.alicealexandra.com/studio" />
	<meta name="twitter:title" content="Studio" />
	<meta
		name="twitter:description"
		content="The studio works of Alice Alexandra Moore. Enjoy fiction, film, fantasy, poetry, illustrations, music, essays, websites, and more."
	/>
	<meta name="twitter:image" content="https://pub-a1233e2ec22b407fb8ef2b8a06521728.r2.dev/studio/studioog.jpg" />
	<meta name="twitter:image:alt" content="The studio page of alicealexandra.com." />
</svelte:head>

<div class="studio-container" use:populate>
	<h1 class="studio-title">studio</h1>

	<OptimizedImage
		src="https://pub-a1233e2ec22b407fb8ef2b8a06521728.r2.dev/studio/ink.png"
		alt=""
		class="studio-background" sizes="100vw"
	/>

	<div class="break"></div>

	<div class="card-div">
		{#each cards as card}
			<StudioCard {card} />
		{/each}
	</div>

	<div class="break"></div>
</div>

<style>
	.studio-container {
		position: relative;
		--ink-target-opacity: 0.4;
		background-color: var(--color-bg);
		min-height: 100lvh;
		overflow: hidden;
	}

	.studio-title {
		position: absolute;
		scale: 0;
		opacity: 0;
	}

	:global(.studio-background) {
		position: fixed;
		top: 0;
		left: 0;
		opacity: 0;
		z-index: 0;
		width: 100%;
		height: 100vh;
		object-fit: cover;
		pointer-events: none;
	}

	@media (prefers-color-scheme: dark) {
		.studio-container {
			--ink-target-opacity: 0.16;
		}

		:global(.studio-background) {
			mix-blend-mode: screen;
			filter: grayscale(1) invert(1) contrast(1.15);
		}
	}

	.break {
		height: 3rem;
	}

	.card-div {
		display: flex;
		position: relative;
		flex-wrap: wrap;
		justify-content: center;
		align-items: flex-start;
		gap: 3rem;
		opacity: 0;
		z-index: 1;
	}

	@media (min-width: 640px) {
		.card-div {
			justify-content: center;
			padding-right: 2.5rem;
			padding-left: 2.5rem;
		}
	}
</style>
