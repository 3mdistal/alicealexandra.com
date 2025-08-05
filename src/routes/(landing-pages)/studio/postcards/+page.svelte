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
			<article class="postcard">
				<h2>
					<a href="/studio/postcards/{postcard.slug}">{postcard.title}</a>
				</h2>
				{#if postcard.description}
					<p class="description">{postcard.description}</p>
				{/if}
				{#if postcard.heroImage}
					<img src={postcard.heroImage} alt={postcard.title} />
				{/if}
				<time datetime={postcard.lastEditedTime}>
					{new Date(postcard.lastEditedTime).toLocaleDateString()}
				</time>
			</article>
		{:else}
			<p>No postcards available at the moment.</p>
		{/each}
	</section>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	header p {
		font-size: 1.2rem;
		color: #666;
	}

	.summary {
		font-style: italic;
		margin-top: 1rem;
	}

	.postcards-grid {
		display: grid;
		gap: 2rem;
	}

	.postcard {
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 1.5rem;
		background: white;
	}

	.postcard h2 {
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
	}

	.postcard h2 a {
		color: inherit;
		text-decoration: none;
	}

	.postcard h2 a:hover {
		text-decoration: underline;
	}

	.description {
		color: #666;
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.postcard img {
		width: 100%;
		height: 200px;
		object-fit: cover;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	time {
		font-size: 0.9rem;
		color: #999;
		font-style: italic;
	}
</style>
