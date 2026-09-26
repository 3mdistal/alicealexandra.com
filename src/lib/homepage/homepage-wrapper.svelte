<script lang="ts" context="module">
	let hasHydrated = false;
</script>

<script lang="ts">
	import HomepageSection from '$lib/homepage/homepage-section.svelte';
	import { names } from '../stores';
	import { prefersReducedMotion } from '$lib/accessibility/prefers-reduced-motion';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	type Gsap = typeof import('gsap').gsap;

	// The bands spring in as the CSS title intro finishes, measured from when that intro began.
	const BANDS_START_MS = 1000;

	let homepageWrapper: HTMLElement;
	let gsap: Gsap | null = null;

	function introStartedAt(): number {
		const mountedAt = performance.now();
		if (hasHydrated) return mountedAt;
		hasHydrated = true;
		const firstPaint = performance.getEntriesByName('first-contentful-paint')[0]?.startTime;
		return firstPaint ?? mountedAt;
	}

	function reveal() {
		homepageWrapper.style.opacity = '1';
		homepageWrapper.style.pointerEvents = 'auto';
	}

	function springIn(introStart: number) {
		if (!gsap) return;
		const delay = Math.max(0.1, (introStart + BANDS_START_MS - performance.now()) / 1000);
		gsap.to(homepageWrapper.children, {
			scaleY: 1,
			opacity: 1,
			ease: 'elastic',
			duration: 2,
			delay,
			stagger: 0.1,
			onStart: reveal
		});
	}

	function transitionOutWrapper() {
		if (!gsap || get(prefersReducedMotion)) return;
		const tl = gsap.timeline();
		tl.to(homepageWrapper, { y: '10vh', ease: 'power4.out' });
		tl.to(homepageWrapper, { opacity: 0, delay: 0.15 });
	}

	onMount(async () => {
		const introStart = introStartedAt();

		if (get(prefersReducedMotion)) {
			reveal();
			return;
		}

		try {
			gsap = (await import('gsap')).gsap;
		} catch {
			reveal();
			return;
		}

		// Prevent a one-frame flash of the "final" layout before GSAP applies initial values.
		gsap.set(homepageWrapper, { opacity: 1 });
		gsap.set(homepageWrapper.children, {
			scaleY: 0.3,
			opacity: 0
		});

		springIn(introStart);
	});
</script>

<nav bind:this={homepageWrapper} aria-label="Sections" data-sveltekit-preload-code="hover">
	{#each $names as name}
		<HomepageSection {name} {transitionOutWrapper} />
	{/each}
</nav>

<style>
	nav {
		position: relative;
		bottom: -10dvh;
		width: 100%;
		height: 100dvh;
	}

	/* Hidden only when scripts run, so the menu still shows without JavaScript. */
	:global(html.js) nav {
		opacity: 0;
		pointer-events: none;
	}

	@media (min-width: 1024px), (orientation: landscape) and (min-width: 600px) {
		nav {
			position: absolute;
			bottom: -35dvh;
		}
	}
</style>
