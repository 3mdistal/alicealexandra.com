<script lang="ts">
	import ParallaxPostcard from '#lib/components/parallax-postcard.svelte';
	import PostcardModal from '#lib/components/postcard-modal.svelte';
	import { preloadData, goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data } = $props();
	let rotations: number[] = [];

	// Generate rotations function
	function getRotation(index: number): number {
		if (rotations[index] !== undefined) {
			return rotations[index];
		}

		let rotation: number;

		// For desktop two-column layout, ensure adjacent cards have different angles
		if (typeof window !== 'undefined' && window.innerWidth >= 1024 && index > 0) {
			// Check if this is in the same row as the previous card (even/odd pairs)
			const isInSameRow = Math.floor(index / 2) === Math.floor((index - 1) / 2);

			if (isInSameRow) {
				// Ensure at least 8 degrees difference from the previous card
				const previousRotation = rotations[index - 1] ?? 0;
				do {
					rotation = (Math.random() - 0.5) * 16; // -8 to 8 degrees
				} while (Math.abs(rotation - previousRotation) < 8);
			} else {
				rotation = (Math.random() - 0.5) * 16;
			}
		} else {
			rotation = (Math.random() - 0.5) * 16;
		}

		rotations[index] = rotation;
		return rotation;
	}
</script>

<svelte:head>
	<title>Postcards</title>
	<meta
		name="description"
		content="Flash fiction, short stories, essays, and anything else that doesn't really fit. Work by Alice Alexandra Moore."
	/>
</svelte:head>

<main>
	<header>
		<h1>Postcards</h1>
		<p class="subtitle">All the rest from far away.</p>
	</header>

	<section class="postcards-grid">
		{#each data.postcards as postcard, index}
			{@const rotation = getRotation(index)}
			<ParallaxPostcard
				title={postcard.title}
				description={postcard.description}
				heroImage={postcard.heroImage}
				href="/studio/postcards/{postcard.slug}"
				initialRotation={rotation}
				slug={postcard.slug}
				onclick={async (e) => {
					const href = `/studio/postcards/${postcard.slug}`;

					// On tablet and narrower (<1024px), navigate directly (no modal)
					if (typeof window !== 'undefined' && window.innerWidth < 1024) {
						return; // allow native navigation via href
					}

					// Desktop: open modal with animation
					e.preventDefault();

					// Get the clicked postcard's position and size for animation
					const postcardElement = e.currentTarget as HTMLElement | null;
					if (!postcardElement) {
						goto(href);
						return;
					}
					const rect = postcardElement.getBoundingClientRect();

					// Preload the data for the postcard
					const result = await preloadData(href);

					if (result.type === 'loaded' && result.status === 200) {
						// Use shallow routing to show the modal with animation data
						pushState(href, {
							selectedPostcard: result.data,
							animationOrigin: {
								x: rect.left,
								y: rect.top,
								width: rect.width,
								height: rect.height
							}
						});
					} else {
						// Fallback to normal navigation
						goto(href);
					}
				}}
			/>
		{:else}
			<p class="no-postcards">No postcards available at the moment.</p>
		{/each}
	</section>
</main>

{#if (page.state as any).selectedPostcard}
	<PostcardModal data={(page.state as any).selectedPostcard} onclose={() => history.back()} />
{/if}

<style>
	main {
		position: relative;
		right: 50%;
		left: 50%;
		margin: 0;
		margin-right: var(--layout-full-bleed-margin);
		margin-left: var(--layout-full-bleed-margin);
		background-color: var(--color-content-bg);
		padding: 0;
		width: 100vw;
		min-height: 100vh;
		color: var(--color-content-text);
	}

	header {
		margin-right: auto;
		margin-bottom: var(--space-48);
		margin-left: auto;
		padding: var(--space-32);
		max-width: 800px;
		text-align: center;
	}

	/* More space on desktop due to offset postcards */
	@media (min-width: 1024px) {
		header {
			margin-bottom: var(--space-80);
		}
	}

	h1 {
		margin-bottom: var(--space-8);
		color: var(--color-content-text);
		font-size: var(--font-size-40);
	}

	.subtitle {
		margin-top: var(--space-8);
		color: var(--color-content-secondary);
		font-style: italic;
		font-weight: 300;
		font-size: var(--font-size-20);
		letter-spacing: 0.02em;
	}

	.postcards-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-40);
		margin: 0 auto;
		padding: 0 var(--space-32) var(--space-64) var(--space-32);
		max-width: 600px;
	}

	/* Desktop layout: two columns with staggered positioning */
	@media (min-width: 1024px) {
		.postcards-grid {
			grid-template-columns: 1fr 1fr;
			align-items: start;
			gap: var(--space-48) var(--space-64);
			padding-bottom: var(--space-96);
			max-width: 1200px;
		}

		/* Left column offset higher */
		.postcards-grid :global(.postcard-link):nth-child(odd) {
			transform-origin: center center;
			margin-top: calc(-1 * var(--space-48));
		}

		/* Right column at normal position */
		.postcards-grid :global(.postcard-link):nth-child(even) {
			transform-origin: center center;
			margin-top: var(--space-48);
		}
	}

	@media (max-width: 768px) {
		.postcards-grid {
			gap: var(--space-32);
			padding: 0 var(--space-16);
		}

		header {
			padding: var(--space-24);
		}
	}

	.no-postcards {
		margin-top: var(--space-64);
		color: var(--color-content-secondary);
		font-style: italic;
		font-size: var(--font-size-18);
		text-align: center;
	}
</style>
