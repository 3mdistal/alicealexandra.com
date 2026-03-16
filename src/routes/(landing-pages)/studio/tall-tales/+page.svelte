<script lang="ts">
	import LinkButton from '$lib/components/ui/link-button.svelte';
	import { prefersReducedMotion } from '$lib/accessibility/prefers-reduced-motion';
	import { fade } from 'svelte/transition';

	let { data } = $props();
	const tales = $derived(data.tales || []);

	let expandedSlug = $state<string | null>(null);

	function toggleExpanded(slug: string) {
		if (expandedSlug === slug) {
			expandedSlug = null;
		} else {
			expandedSlug = slug;
		}
	}

	function transitionDuration(duration: number): number {
		return $prefersReducedMotion ? 1 : duration;
	}
</script>

<svelte:head>
	<title>Tall Tales</title>
	<meta name="description" content="Immersive long-form fiction" />
</svelte:head>

<div class="ribbon-container">
	{#each tales as tale}
		<button
			type="button"
			class="ribbon {expandedSlug === tale.slug ? 'expanded' : ''}"
			onclick={() => toggleExpanded(tale.slug)}
			style="--bg-image: url('{tale.coverImage}')"
			aria-expanded={expandedSlug === tale.slug}
			aria-label={expandedSlug === tale.slug ? `Collapse ${tale.title}` : `Expand ${tale.title}`}
		>
			<div class="ribbon-overlay"></div>
			<div class="ribbon-content">
				{#if expandedSlug === tale.slug}
					<div
						class="active-story-content"
						in:fade={{ duration: transitionDuration(250) }}
						out:fade={{ duration: transitionDuration(100) }}
					>
						<h2 class="title">{tale.title}</h2>
						<p class="description">{tale.description}</p>
						<LinkButton
							href="/studio/tall-tales/{tale.slug}"
							variant="solid"
							size="lg"
							on:click={(e: Event) => e.stopPropagation()}>Read Story</LinkButton
						>
					</div>
				{/if}
			</div>
		</button>
	{/each}

	{#if tales.length === 0}
		<div class="empty-state">
			<h1>No tales found</h1>
			<p>Check back later for new stories.</p>
		</div>
	{/if}
</div>

<style>
	.ribbon-container {
		display: flex;
		/* Reset layout margins */
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		background: var(--color-bg);
		width: 100vw;
		height: 100vh;
	}

	.ribbon {
		display: flex;
		position: relative;
		flex: 1;
		flex-direction: column;
		justify-content: flex-end;
		filter: saturate(0.6) brightness(0.8);
		transition:
			flex 0.6s cubic-bezier(0.19, 1, 0.22, 1),
			filter 0.4s ease;
		cursor: pointer;
		border: none;
		background-image: var(--bg-image);
		background-position: center;
		background-size: cover;
		padding: 0;
		overflow: hidden;
		color: var(--color-neutral-0);
		text-align: left;
	}

	.ribbon:hover {
		filter: saturate(0.8) brightness(0.9);
	}

	.ribbon.expanded {
		flex: 5;
		filter: saturate(1) brightness(1);
		cursor: default;
	}

	.ribbon-overlay {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 1;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.9) 0%,
			rgba(0, 0, 0, 0.2) 50%,
			rgba(0, 0, 0, 0.1) 100%
		);
	}

	.ribbon-content {
		display: flex;
		position: relative;
		align-items: flex-end;
		z-index: 2;
		box-sizing: border-box;
		padding: var(--space-7);
		width: 100%;
		min-width: 0;
		min-height: 100%;
	}

	.active-story-content {
		max-width: 500px;
	}

	.title {
		margin: 0;
		font-size: var(--font-size-3xl);
		line-height: var(--line-height-tight);
		font-family: var(--font-serif);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	}

	.description {
		margin: var(--space-4) 0 var(--space-6);
		font-size: var(--font-size-lg);
		line-height: var(--line-height-body);
		font-family: var(--font-serif);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
		color: var(--color-text);
	}

	/* Responsive: stack vertically */
	@media (max-aspect-ratio: 1/1) {
		.ribbon-container {
			flex-direction: column;
		}

		.ribbon-content {
			padding: var(--space-5);
		}

		.title {
			font-size: var(--font-size-2xl);
		}
	}
</style>
