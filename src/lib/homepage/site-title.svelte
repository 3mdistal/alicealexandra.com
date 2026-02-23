<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cubicIn } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { pageState } from '$lib/stores';

	type Gsap = typeof import('gsap').gsap;

	let gsap: Gsap | null = null;
	let logo: HTMLImageElement | null = $state(null);
	let siteTitle: HTMLParagraphElement | null = $state(null);
	let subtitle: HTMLParagraphElement | null = $state(null);

	onMount(async () => {
		const mod = await import('gsap');
		gsap = mod.gsap;
		inAnimation();
	});

	function inAnimation() {
		if (!gsap || !logo || !siteTitle || !subtitle) return;

		const tl = gsap.timeline();

		tl.fromTo(
			logo,
			{
				opacity: 0,
				x: '-200%',
				rotation: '-360deg'
			},
			{
				opacity: 1,
				x: '0%',
				rotation: 0,
				duration: 1,
				ease: 'back'
			}
		);
		tl.to(siteTitle, { opacity: 1, duration: 0.5, ease: 'power1.in' }, '<');
		tl.to(subtitle, { opacity: 1, duration: 0.5, ease: 'power1.in' }, '<.5');

		return tl;
	}

	function flyRotate(_node: Element, { duration = 500, x = -400, rotation = -360 } = {}) {
		return {
			duration,
			css: (t: number) => {
				const eased = cubicIn(t);

				return `
					transform: translateX(${(1 - eased) * x}%) rotate(${(1 - eased) * rotation}deg);
					opacity: ${eased};
				`;
			}
		};
	}

	$effect(() => {
		inAnimation();
	});
</script>

{#if $pageState === 'home'}
	<header class="site-header-container">
		<img
			bind:this={logo}
			src="images/logos/logo.svg"
			alt="The logo for Tempo Immaterial."
			class="logo"
			out:flyRotate={{ duration: 750, x: -400, rotation: -360 * 1.5 }}
		/>
		<div>
			<h1 bind:this={siteTitle} class="site-title" out:fade={{ duration: 500 }}>
				tempo immaterial
			</h1>
			<p bind:this={subtitle} class="subtitle" out:fade={{ duration: 500 }}>
				work by alice alexandra moore
			</p>
		</div>
	</header>
{/if}

<style>
	.site-header-container {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		margin-right: auto;
		margin-left: auto;
		width: 80vw;
	}

	.logo {
		opacity: 0;
		width: 4rem;
	}

	.site-title {
		opacity: 0;
		margin-bottom: 0.5em;
		font-weight: 300;
		font-size: clamp(1.5rem, 4vw, 3rem);
		letter-spacing: 0.4em;
		text-align: center;
	}

	.subtitle {
		opacity: 0;
		font-weight: 300;
		font-size: clamp(1rem, 2.5vw, 1.8rem);
		letter-spacing: 0.15em;
		text-align: center;
	}

	@media (min-width: 640px) {
		.site-header-container {
			gap: 2em;
		}

		.logo {
			width: 6rem;
		}
	}

	@media (min-width: 768px) {
		.site-header-container {
			flex-direction: row;
		}

		.logo {
			width: 8rem;
		}
	}

	@media (min-width: 1024px) {
		.site-header-container {
			gap: 2em;
		}

		.logo {
			width: 12rem;
		}
	}

	@media (prefers-color-scheme: dark) {
		.logo {
			filter: invert(1) hue-rotate(220deg) brightness(0.85) contrast(1.1);
			opacity: 0.9;
		}
	}
</style>
