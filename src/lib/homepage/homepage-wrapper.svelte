<script lang="ts">
	import HomepageSection from '$lib/homepage/homepage-section.svelte';
	import { backgroundColors, names } from '../stores';
	import { onMount } from 'svelte';

	type Gsap = typeof import('gsap').gsap;

	let homepageWrapper: HTMLElement;
	let gsap: Gsap | null = null;

	function springIn() {
		if (!gsap) return;
		gsap.from(homepageWrapper.children, {
			scaleY: 0.3,
			opacity: 0,
			ease: 'elastic',
			duration: 2,
			delay: 1.5,
			stagger: 0.1
		});
	}

	function easeOut() {
		if (!gsap) return;
		const tl = gsap.timeline();
		tl.to(homepageWrapper, { y: '10vh', ease: 'power4.out' });
		tl.to(homepageWrapper, { opacity: 0, delay: 0.15 });

		return tl;
	}

	function transitionOutWrapper() {
		easeOut();
	}

	onMount(async () => {
		homepageWrapper.style.opacity = '1';
		const mod = await import('gsap');
		gsap = mod.gsap;
		springIn();
	});
</script>

<nav bind:this={homepageWrapper}>
	{#each $names as name}
		<HomepageSection background={$backgroundColors[name]} {name} {transitionOutWrapper} />
	{/each}
</nav>

<style>
	nav {
		position: relative;
		bottom: -10vh;
		opacity: 0;
		width: 100%;
		height: 100vh;
	}

	@media (min-width: 1024px) {
		nav {
			position: absolute;
			bottom: -35vh;
		}
	}
</style>
