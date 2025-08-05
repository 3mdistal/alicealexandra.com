<script lang="ts">
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
			<a href="/studio/postcards/{postcard.slug}" class="postcard-link">
				<article class="postcard" style="background-image: url('{postcard.heroImage || 'https://unsplash.it/1200/600'}')">
					<div class="postcard-overlay">
						<div class="postcard-content">
							<h2>{postcard.title}</h2>
							{#if postcard.description}
								<p class="description">{postcard.description}</p>
							{/if}
						</div>
					</div>
				</article>
			</a>
		{:else}
			<p>No postcards available at the moment.</p>
		{/each}
	</section>
</main>

<style>
	:global(body) {
		background-color: black;
		color: white;
	}

	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		background-color: black;
		color: white;
		min-height: 100vh;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
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
		gap: 3rem;
		margin: 0 -2rem;
	}

	.postcard-link {
		display: block;
		text-decoration: none;
		color: inherit;
	}

	.postcard {
		position: relative;
		height: 400px;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		border-radius: 12px;
		overflow: hidden;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		cursor: pointer;
	}

	.postcard-link:hover .postcard {
		transform: translateY(-4px);
		box-shadow: 0 20px 40px rgba(255, 255, 255, 0.1);
	}

	.postcard-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			135deg,
			rgba(0, 0, 0, 0.7) 0%,
			rgba(0, 0, 0, 0.4) 50%,
			rgba(0, 0, 0, 0.8) 100%
		);
		display: flex;
		align-items: flex-end;
		padding: 2rem;
	}

	.postcard-content {
		color: white;
		width: 100%;
	}

	.postcard h2 {
		margin: 0 0 1rem 0;
		font-size: 2rem;
		font-weight: 600;
		line-height: 1.2;
		color: white;
	}

	.description {
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		line-height: 1.5;
		font-size: 1.1rem;
		max-width: 80%;
	}

	@media (max-width: 768px) {
		.postcards-grid {
			margin: 0 -1rem;
			gap: 2rem;
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
</style>
