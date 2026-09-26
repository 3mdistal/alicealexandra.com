<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cubicIn } from 'svelte/easing';
	import { prefersReducedMotion } from '$lib/accessibility/prefers-reduced-motion';
	import { get } from 'svelte/store';
	import { pageState } from '$lib/stores';

	function reducedMotionEnabled(): boolean {
		return get(prefersReducedMotion);
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
</script>

{#if $pageState === 'home'}
	<header class="site-header-container">
		<img
			src="/images/logos/logo.svg"
			alt=""
			width="192"
			height="192"
			class="logo"
			out:flyRotate={{
				duration: reducedMotionEnabled() ? 1 : 750,
				x: reducedMotionEnabled() ? 0 : -400,
				rotation: reducedMotionEnabled() ? 0 : -360 * 1.5
			}}
		/>
		<div>
			<h1 class="site-title" out:fade={{ duration: reducedMotionEnabled() ? 1 : 500 }}>
				tempo immaterial
			</h1>
			<p class="subtitle" out:fade={{ duration: reducedMotionEnabled() ? 1 : 500 }}>
				work by alice alexandra moore
			</p>
		</div>
	</header>
{/if}

<style>
	/* The intro runs in CSS so it starts with the first paint rather than after scripts load. */
	@keyframes roll-in {
		from {
			transform: translateX(-200%) rotate(-360deg);
			opacity: 0;
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

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
		animation: roll-in 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
		width: 4rem;
		height: auto;
	}

	/* Letter-spacing trails the last glyph; matching leading space keeps the text optically centered. */
	.site-title {
		animation: fade-in 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53) both;
		margin-bottom: 0.5em;
		padding-inline-start: 0.4em;
		font-weight: 300;
		font-size: clamp(1.5rem, 4vw, 3rem);
		letter-spacing: 0.4em;
		text-align: center;
	}

	.subtitle {
		animation: fade-in 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53) 0.5s both;
		padding-inline-start: 0.15em;
		font-weight: 300;
		font-size: clamp(1rem, 2.5vw, 1.8rem);
		letter-spacing: 0.15em;
		text-align: center;
	}

	@media (prefers-reduced-motion: reduce) {
		.logo,
		.site-title,
		.subtitle {
			animation: none;
		}
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

	/* Wide composition (see homepage-wrapper): size by height too, so the header clears the waves. */
	@media (min-width: 1024px), (orientation: landscape) and (min-width: 600px) {
		.site-header-container {
			flex-direction: row;
			gap: 2em;
		}

		.logo {
			width: min(12rem, 26.7dvh, 15vw);
		}

		.site-title {
			font-size: clamp(1.5rem, min(4vw, 6.7dvh), 3rem);
		}

		.subtitle {
			font-size: clamp(1rem, min(2.5vw, 4dvh), 1.8rem);
		}
	}

	@media (min-width: 2200px) and (min-height: 1200px) {
		.logo {
			width: min(16rem, 26.7dvh, 15vw);
		}

		.site-title {
			font-size: clamp(3rem, min(4vw, 6.7dvh), 4rem);
		}

		.subtitle {
			font-size: clamp(1.8rem, min(2.5vw, 4dvh), 2.4rem);
		}
	}
</style>
