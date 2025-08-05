<script lang="ts">
	import ParallaxPostcard from '$lib/components/parallax-postcard.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();
	let gridElement: HTMLElement;

	onMount(() => {
		if (gridElement) {
			// Apply random rotation to each postcard on desktop only
			const postcards = gridElement.querySelectorAll('.postcard-link');
			const rotations: number[] = [];

			postcards.forEach((postcard, index) => {
				let rotation: number;

				// For desktop two-column layout, ensure adjacent cards have different angles
				if (window.innerWidth >= 1024 && index > 0) {
					// Check if this is in the same row as the previous card (even/odd pairs)
					const isInSameRow = Math.floor(index / 2) === Math.floor((index - 1) / 2);

					if (isInSameRow) {
						// Ensure at least 8 degrees difference from the previous card
						const previousRotation = rotations[index - 1];
						do {
							rotation = (Math.random() - 0.5) * 16; // -8 to 8 degrees
						} while (Math.abs(rotation - previousRotation) < 8);
					} else {
						rotation = (Math.random() - 0.5) * 16;
					}
				} else {
					rotation = (Math.random() - 0.5) * 16;
				}

				rotations.push(rotation);
				(postcard as HTMLElement).style.transform = `rotate(${rotation}deg)`;
			});
		}
	});
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

	<section class="postcards-grid" bind:this={gridElement}>
		{#each data.postcards as postcard}
			<ParallaxPostcard
				title={postcard.title}
				description={postcard.description}
				heroImage={postcard.heroImage}
				href="/studio/postcards/{postcard.slug}"
			/>
		{:else}
			<p class="no-postcards">No postcards available at the moment.</p>
		{/each}
	</section>
</main>

<style>
	:global(body) {
		background-color: black !important;
		color: white;
	}

	:global(html) {
		background-color: black !important;
	}

	main {
		background-color: black;
		color: white;
		min-height: 100vh;
		padding: 0;
		margin: 0;
		width: 100vw;
		position: relative;
		left: 50%;
		right: 50%;
		margin-left: -50vw;
		margin-right: -50vw;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
		padding: 2rem;
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: white;
	}

	.subtitle {
		font-size: 1.3rem;
		color: #ccc;
		font-style: italic;
		margin-top: 0.5rem;
		font-weight: 300;
		letter-spacing: 0.02em;
	}

	.postcards-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem;
		padding: 0 2rem;
		max-width: 600px;
		margin: 0 auto;
	}

	/* Desktop layout: two columns with staggered positioning */
	@media (min-width: 1024px) {
		.postcards-grid {
			grid-template-columns: 1fr 1fr;
			gap: 3rem 4rem;
			max-width: 1200px;
			align-items: start;
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
			padding: 0 1rem;
			gap: 2rem;
		}

		header {
			padding: 1.5rem;
		}
	}

	.no-postcards {
		text-align: center;
		color: #888;
		font-style: italic;
		font-size: 1.1rem;
		margin-top: 4rem;
	}
</style>
