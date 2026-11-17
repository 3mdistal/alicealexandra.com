<!-- Prototype: landing 1, "strips, finished". Today's strips, titled at rest, one click to read. -->
<script lang="ts">
	import ProtoSwitch from '$lib/prototypes/tall-tales/proto-switch.svelte';
	import { landingLinks } from '$lib/prototypes/tall-tales/links';

	let { data } = $props();
	const tales = $derived(data.tales || []);
</script>

<svelte:head>
	<title>Tall Tales</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="strips">
	{#each tales as tale}
		<a class="strip" href="/studio/tall-tales/{tale.slug}" style="--cover: url('{tale.coverImage}')">
			<span class="title">{tale.title}</span>
		</a>
	{/each}
</div>

<ProtoSwitch links={landingLinks()} current="1" />

<style>
	.strips {
		display: flex;
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		background: var(--color-neutral-1000);
		width: 100vw;
		height: 100vh;
		height: 100svh;
	}

	.strip {
		display: flex;
		position: relative;
		flex: 1;
		align-items: flex-end;
		filter: saturate(0.55) brightness(0.72);
		transition:
			flex 0.9s cubic-bezier(0.19, 1, 0.22, 1),
			filter 0.5s ease;
		background-image: var(--cover);
		background-position: center;
		background-size: cover;
		overflow: hidden;
		color: var(--color-neutral-0);
		text-decoration: none;
	}

	.strip::after {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to right,
			color-mix(in srgb, var(--color-neutral-1000) 45%, transparent),
			transparent 70%
		);
		content: '';
	}

	.strips:hover .strip:not(:hover) {
		filter: saturate(0.35) brightness(0.5);
	}

	.strip:hover,
	.strip:focus-visible {
		flex: 2.6;
		filter: saturate(1) brightness(0.95);
	}

	.strip:focus-visible {
		outline: 2px solid var(--color-neutral-0);
		outline-offset: -6px;
	}

	.title {
		position: relative;
		z-index: 1;
		transform: rotate(180deg);
		padding: var(--space-7) var(--space-6);
		font-weight: var(--font-weight-light);
		font-size: clamp(1.5rem, 2.4vw, 2.5rem);
		line-height: 1;
		font-family: var(--font-serif);
		letter-spacing: 0.14em;
		white-space: nowrap;
		text-shadow: 0 2px 12px color-mix(in srgb, var(--color-neutral-1000) 60%, transparent);
		text-transform: lowercase;
		writing-mode: vertical-rl;
	}

	@media (max-aspect-ratio: 1/1) {
		.strips {
			flex-direction: column;
		}

		.strip::after {
			background: linear-gradient(
				to top,
				color-mix(in srgb, var(--color-neutral-1000) 55%, transparent),
				transparent 75%
			);
		}

		.title {
			transform: none;
			padding: var(--space-5);
			font-size: clamp(1.4rem, 6vw, 2rem);
			white-space: normal;
			writing-mode: horizontal-tb;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.strip {
			transition: filter 0.2s ease;
		}
	}
</style>
