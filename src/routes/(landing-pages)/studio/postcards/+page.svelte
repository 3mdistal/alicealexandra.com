<script lang="ts">
	import ParallaxPostcard from '$lib/components/parallax-postcard.svelte';
	import PostcardModal from '$lib/components/postcard-modal.svelte';
	import { preloadData, pushState, goto } from '$app/navigation';
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
		margin-right: -50vw;
		margin-left: -50vw;
		background-color: var(--color-content-bg);
		padding: 0;
		width: 100vw;
		min-height: 100vh;
		color: var(--color-content-text);
	}

	header {
		margin-right: auto;
		margin-bottom: 3rem;
		margin-left: auto;
		padding: 2rem;
		max-width: 800px;
		text-align: center;
	}

	/* More space on desktop due to offset postcards */
	@media (min-width: 1024px) {
		header {
			margin-bottom: 5rem;
		}
	}

	h1 {
		margin-bottom: 0.5rem;
		color: var(--color-content-text);
		font-size: 2.5rem;
	}

	.subtitle {
		margin-top: 0.5rem;
		color: var(--color-content-secondary);
		font-style: italic;
		font-weight: 300;
		font-size: 1.3rem;
		letter-spacing: 0.02em;
	}

	.postcards-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem;
		margin: 0 auto;
		padding: 0 2rem 4rem 2rem;
		max-width: 600px;
	}

	/* Desktop layout: two columns with staggered positioning */
	@media (min-width: 1024px) {
		.postcards-grid {
			grid-template-columns: 1fr 1fr;
			align-items: start;
			gap: 3rem 4rem;
			padding-bottom: 6rem;
			max-width: 1200px;
		}

		/* Left column offset higher */
		.postcards-grid :global(.postcard-link):nth-child(odd) {
			transform-origin: center center;
			margin-top: -50px;
		}

		/* Right column at normal position */
		.postcards-grid :global(.postcard-link):nth-child(even) {
			transform-origin: center center;
			margin-top: 50px;
		}
	}

	@media (max-width: 768px) {
		.postcards-grid {
			gap: 2rem;
			padding: 0 1rem;
		}

		header {
			padding: 1.5rem;
		}
	}

	.no-postcards {
		margin-top: 4rem;
		color: var(--color-content-secondary);
		font-style: italic;
		font-size: 1.1rem;
		text-align: center;
	}
</style>
