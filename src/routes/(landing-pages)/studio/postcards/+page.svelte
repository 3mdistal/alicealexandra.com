<script lang="ts">
	import ParallaxPostcard from '$lib/components/parallax-postcard.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();
	let gridElement: HTMLElement;

	onMount(() => {
		if (gridElement) {
			// Apply random rotation to each postcard on desktop only
			const postcards = gridElement.querySelectorAll('.postcard-link');
			postcards.forEach((postcard, index) => {
				// Random rotation between -8 and 8 degrees
				const rotation = (Math.random() - 0.5) * 16;
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
