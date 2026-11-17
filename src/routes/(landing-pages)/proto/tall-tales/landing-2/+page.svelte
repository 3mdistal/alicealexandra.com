<!-- Prototype: landing 2, "Painted Hills". Each cover rises out of its hill; the hill lines cross. -->
<script lang="ts">
	import ProtoSwitch from '$lib/prototypes/tall-tales/proto-switch.svelte';
	import { landingLinks } from '$lib/prototypes/tall-tales/links';
	import { IMAGE_DOMAIN } from '$lib/utils/images';

	let { data } = $props();
	const tales = $derived(data.tales || []);

	// Hills sit at different heights so neighbouring lines cross.
	const lifts = ['0vh', '-9vh', '3vh', '-5vh', '6vh', '-11vh'];
	const fills = ['var(--color-indigo-300)', 'var(--color-indigo-250)', 'var(--color-indigo-350)'];
</script>

<svelte:head>
	<title>Tall Tales</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="land">
	<img class="ink" src="https://{IMAGE_DOMAIN}/studio/ink.png" alt="" />

	<div class="hills">
		{#each tales as tale, i}
			<a
				class="hill"
				href="/studio/tall-tales/{tale.slug}"
				style="--cover: url('{tale.coverImage}'); --lift: {lifts[i % lifts.length]}; --fill: {fills[
					i % fills.length
				]}; --order: {i};"
			>
				<span class="painting" aria-hidden="true"></span>
				<svg class="ground" viewBox="0 0 600 240" preserveAspectRatio="none" aria-hidden="true">
					<path class="ground-fill" d="M0,120 C140,20 460,20 600,120 L600,1600 L0,1600 Z" />
					<path class="ground-line" d="M0,120 C140,20 460,20 600,120" />
				</svg>
				<span class="title">{tale.title}</span>
			</a>
		{/each}
	</div>
</div>

<ProtoSwitch links={landingLinks()} current="2" />

<style>
	.land {
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		background: var(--color-indigo-250);
		width: 100vw;
		min-height: 100vh;
		min-height: 100svh;
		overflow: hidden;
		overflow: clip;
	}

	.ink {
		position: absolute;
		opacity: 0.32;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
	}

	.hills {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: flex-end;
		isolation: isolate;
		box-sizing: border-box;
		padding: 14vh 4vw 0;
		height: 100vh;
		height: 100svh;
	}

	.hill {
		display: block;
		position: relative;
		top: var(--lift);
		flex: 0 1 23vw;
		height: 74vh;
		color: var(--color-indigo-800);
		text-decoration: none;
	}

	.painting {
		position: absolute;
		z-index: calc(var(--order) * 2 + 1);
		inset: 0 17% 24% 17%;
		filter: saturate(0.8);
		transition:
			transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1),
			filter 0.5s ease;
		border-radius: 999px 999px 0 0;
		background-image: var(--cover);
		background-position: center;
		background-size: cover;
		box-shadow: 0 18px 40px color-mix(in srgb, var(--color-indigo-800) 22%, transparent);
	}

	.ground {
		position: absolute;
		bottom: -2px;
		left: -32%;
		z-index: calc(var(--order) * 2 + 2);
		width: 164%;
		max-width: none;
		height: 46%;
		overflow: visible;
	}

	.ground-fill {
		fill: var(--fill);
	}

	.ground-line {
		fill: none;
		stroke: var(--color-indigo-800);
		stroke-width: 1.5;
		vector-effect: non-scaling-stroke;
	}

	.title {
		position: absolute;
		right: 0;
		bottom: 12%;
		left: 0;
		z-index: 100;
		padding: 0 var(--space-2);
		font-weight: var(--font-weight-light);
		font-size: clamp(1.1rem, 1.7vw, 1.75rem);
		line-height: 1.2;
		font-family: var(--font-serif);
		letter-spacing: 0.14em;
		text-align: center;
		text-transform: lowercase;
		text-wrap: balance;
	}

	.hill:hover .painting,
	.hill:focus-visible .painting {
		transform: translateY(-18px);
		filter: saturate(1.05);
	}

	.hill:focus-visible {
		outline: none;
	}

	.hill:focus-visible .title {
		text-decoration: underline;
		text-underline-offset: 6px;
	}

	@media (max-width: 760px) {
		.hills {
			flex-direction: column;
			align-items: center;
			padding: 18vh 0 0;
			height: auto;
		}

		.hill {
			top: 0;
			flex: none;
			margin-top: -22vw;
			width: 78vw;
			height: 112vw;
		}

		.hill:first-child {
			margin-top: 0;
		}

		.hill:nth-child(even) {
			align-self: flex-end;
			margin-right: -6vw;
		}

		.hill:nth-child(odd) {
			align-self: flex-start;
			margin-left: -6vw;
		}

		.title {
			font-size: 1.35rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.painting {
			transition: filter 0.2s ease;
		}

		.hill:hover .painting,
		.hill:focus-visible .painting {
			transform: none;
		}
	}
</style>
