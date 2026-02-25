<script lang="ts">
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
</script>

<svelte:head>
	<title>Tall Tales</title>
	<meta name="description" content="Immersive long-form fiction" />
</svelte:head>

<div class="ribbon-container">
	{#each tales as tale}
		<button
			class="ribbon {expandedSlug === tale.slug ? 'expanded' : ''}"
			onclick={() => toggleExpanded(tale.slug)}
			style="--bg-image: url('{tale.coverImage}')"
			aria-expanded={expandedSlug === tale.slug}
		>
			<div class="ribbon-overlay"></div>
			<div class="ribbon-content">
				<h2 class="title">{tale.title}</h2>

				{#if expandedSlug === tale.slug}
					<div class="details">
						<p class="description">{tale.description}</p>
						<a
							href="/studio/tall-tales/{tale.slug}"
							class="read-button"
							onclick={(e) => e.stopPropagation()}>Read Story</a
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
	:global(body) {
		margin: 0;
		padding: 0;
	}

	.ribbon-container {
		display: flex;
		/* Reset layout margins */
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		background: #000;
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
		color: white;
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
		position: relative;
		z-index: 2;
		padding: 3rem;
		min-width: 300px;
	}

	.title {
		transform-origin: left bottom;
		transition: transform 0.4s ease;
		margin: 0;
		font-size: 2.5rem;
		line-height: 1.1;
		font-family: 'Spectral', serif;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	}

	/* When not expanded, tilt the text if you want, but horizontal is fine too.
	   Let's keep it horizontal for now. */

	.details {
		animation: fadeIn 0.6s ease forwards;
		margin-top: 1rem;
	}

	.description {
		margin-bottom: 2rem;
		max-width: 500px;
		font-size: 1.25rem;
		line-height: 1.5;
		font-family: 'Spectral', serif;
	}

	.read-button {
		display: inline-block;
		transition:
			background-color 0.2s,
			color 0.2s;
		border-radius: 4px;
		background: white;
		padding: 0.75rem 2rem;
		color: black;
		font-weight: 600;
		font-size: 0.875rem;
		letter-spacing: 0.1em;
		text-decoration: none;
		text-transform: uppercase;
	}

	.read-button:hover {
		background: #ccc;
	}

	@keyframes fadeIn {
		from {
			transform: translateY(10px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
		color: white;
	}

	/* Responsive: stack vertically */
	@media (max-aspect-ratio: 1/1) {
		.ribbon-container {
			flex-direction: column;
		}

		.ribbon-content {
			padding: 2rem;
		}

		.title {
			font-size: 2rem;
		}
	}
</style>
