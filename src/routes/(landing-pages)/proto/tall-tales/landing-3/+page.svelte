<!-- Prototype: landing 3, "one at a time". A full screen per tale, scrolled like turning pages. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import ProtoSwitch from '$lib/prototypes/tall-tales/proto-switch.svelte';
	import { landingLinks } from '$lib/prototypes/tall-tales/links';

	let { data } = $props();
	const tales = $derived(data.tales || []);

	let reel = $state<HTMLDivElement>();
	let active = $state(0);

	function go(index: number) {
		const panel = reel?.children[index] as HTMLElement | undefined;
		panel?.scrollIntoView({ behavior: 'smooth' });
	}

	onMount(() => {
		if (!reel) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						active = Number((entry.target as HTMLElement).dataset.index);
					}
				}
			},
			{ root: reel, threshold: 0.6 }
		);
		for (const panel of Array.from(reel.children)) observer.observe(panel);
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>Tall Tales</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="reel" bind:this={reel}>
	{#each tales as tale, i}
		<a
			class="panel"
			class:active={i === active}
			data-index={i}
			href="/studio/tall-tales/{tale.slug}"
			style="--cover: url('{tale.coverImage}')"
		>
			<span class="image" aria-hidden="true"></span>
			<span class="title">{tale.title}</span>
			{#if i === 0}
				<span class="cue" aria-hidden="true"></span>
			{/if}
		</a>
	{/each}
</div>

<div class="dots">
	{#each tales as tale, i}
		<button
			type="button"
			class:active={i === active}
			aria-label={tale.title}
			aria-current={i === active ? 'true' : undefined}
			onclick={() => go(i)}
		></button>
	{/each}
</div>

<ProtoSwitch links={landingLinks()} current="3" />

<style>
	.reel {
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		background: var(--color-neutral-1000);
		width: 100vw;
		height: 100vh;
		height: 100svh;
		overflow-y: auto;
		scroll-snap-type: y mandatory;
		scrollbar-width: none;
	}

	.reel::-webkit-scrollbar {
		display: none;
	}

	.panel {
		display: grid;
		position: relative;
		place-items: center;
		height: 100vh;
		height: 100svh;
		overflow: hidden;
		scroll-snap-align: start;
		color: var(--color-neutral-0);
		text-decoration: none;
	}

	.image {
		position: absolute;
		transform: scale(1.08);
		filter: saturate(0.7) brightness(0.62);
		transition:
			transform 2.4s cubic-bezier(0.19, 1, 0.22, 1),
			filter 1.2s ease;
		inset: 0;
		background-image: var(--cover);
		background-position: center;
		background-size: cover;
	}

	.panel.active .image {
		transform: scale(1);
	}

	.panel:hover .image,
	.panel:focus-visible .image {
		filter: saturate(0.95) brightness(0.72);
	}

	.title {
		position: relative;
		opacity: 0;
		transition:
			opacity 1.2s ease 0.2s,
			letter-spacing 1.6s cubic-bezier(0.19, 1, 0.22, 1) 0.2s;
		padding: 0 var(--space-6);
		font-weight: var(--font-weight-light);
		font-size: clamp(2.4rem, 7vw, 6.5rem);
		line-height: 1.05;
		font-family: var(--font-serif);
		letter-spacing: 0.3em;
		text-align: center;
		text-shadow: 0 4px 30px color-mix(in srgb, var(--color-neutral-1000) 55%, transparent);
		text-transform: lowercase;
		text-wrap: balance;
	}

	.panel.active .title {
		opacity: 1;
		letter-spacing: 0.12em;
	}

	.panel:focus-visible {
		outline: 2px solid var(--color-neutral-0);
		outline-offset: -8px;
	}

	.cue {
		position: absolute;
		bottom: var(--space-6);
		left: 50%;
		opacity: 0.7;
		background: var(--color-neutral-0);
		width: 1px;
		height: 44px;
		animation: cue 2.4s ease-in-out infinite;
	}

	@keyframes cue {
		0% {
			transform: scaleY(0);
			transform-origin: top;
		}
		45% {
			transform: scaleY(1);
			transform-origin: top;
		}
		55% {
			transform: scaleY(1);
			transform-origin: bottom;
		}
		100% {
			transform: scaleY(0);
			transform-origin: bottom;
		}
	}

	.dots {
		display: flex;
		position: fixed;
		right: var(--space-5);
		bottom: var(--space-5);
		flex-direction: column;
		z-index: 10;
	}

	.dots button {
		display: grid;
		place-items: center;
		cursor: pointer;
		border: none;
		background: transparent;
		padding: 0;
		width: 24px;
		min-width: 0;
		height: 24px;
		min-height: 0;
	}

	.dots button::before {
		transition:
			background 0.3s ease,
			transform 0.3s ease;
		border: 1px solid color-mix(in srgb, var(--color-neutral-0) 80%, transparent);
		border-radius: 50%;
		width: 9px;
		height: 9px;
		content: '';
	}

	.dots button.active::before {
		transform: scale(1.25);
		background: var(--color-neutral-0);
	}

	@media (prefers-reduced-motion: reduce) {
		.image,
		.title {
			transition: none;
		}

		.cue {
			animation: none;
		}
	}
</style>
