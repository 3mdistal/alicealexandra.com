<script lang="ts">
	import ParallaxPostcard from '$lib/components/parallax-postcard.svelte';

	let { data } = $props();
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
		<p>All the rest from far away</p>
		<p class="summary">Not everything I write fits into a category. This is a place for the outcasts.</p>
	</header>

	<section class="postcards-grid">
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

	header p {
		font-size: 1.2rem;
		color: #ccc;
	}

	.summary {
		font-style: italic;
		margin-top: 1rem;
		color: #aaa;
	}

	.postcards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 320px));
		gap: 2.5rem;
		justify-content: center;
		padding: 0 2rem;
		max-width: 1400px;
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

		.postcard {
			height: 300px;
		}

		.postcard-overlay {
			padding: 1.5rem;
		}

		.postcard h2 {
			font-size: 1.5rem;
		}

		.description {
			font-size: 1rem;
			max-width: 100%;
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
