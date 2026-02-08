<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import type { Illustration } from '$lib/content/studio';

	// Props
	export let data;
	const paintings: Illustration[] = data?.illustrations ?? [];

	// Image quality parameters
	const lowQualityParams = '?tr=f-webp,w-800,q-40';
	const highQualityParams = '?tr=f-webp,w-1600,q-85';

	// State
	let selectedPainting: Illustration | null = null;
	let modalOpen = false;
	let highResImageLoaded = false;

	function openModal(painting: Illustration) {
		selectedPainting = painting;
		modalOpen = true;
		highResImageLoaded = false;
		document.body.style.overflow = 'hidden';

		// Preload high-res image
		const highResSrc = painting.imageUrl;
		if (highResSrc) {
			const highResImage = new Image();
			highResImage.src = highResSrc + highQualityParams;
			highResImage.onload = () => {
				highResImageLoaded = true;
			};
		}
	}

	function closeModal() {
		modalOpen = false;
		selectedPainting = null;
		document.body.style.overflow = '';
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (!modalOpen) return;
		if (event.key !== 'Escape') return;
		event.preventDefault();
		closeModal();
	}

	function handleImageLoad(event: Event) {
		const img = event.target as HTMLImageElement;
		img.style.opacity = '1';
	}
</script>

<svelte:head>
	<title>Illustrations</title>
	<meta
		name="description"
		content="Illustrations, paintings, and other visual art from Alice Alexandra Moore."
	/>
	<meta name="keywords" content="illustrations, paintings, visual art, alice alexandra moore" />

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content="https://www.alicealexandra.com/studio/illustrations" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Illustrations" />
	<meta
		property="og:description"
		content="Illustrations, paintings, and other visual art from Alice Alexandra Moore."
	/>
	<meta
		property="og:image"
		content="https://ik.imagekit.io/tempoimmaterial/studio/illustrations/still%20across%20the%20waters?tr=w-750"
	/>

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@tempoimmaterial" />
	<meta name="twitter:creator" content="@tempoimmaterial" />
	<meta name="twitter:domain" content="alicealexandra.com/studio/illustrations" />
	<meta name="twitter:url" content="https://www.alicealexandra.com/studio/illustrations" />
	<meta name="twitter:title" content="Studio" />
	<meta
		name="twitter:description"
		content="Illustrations, paintings, and other visual art from Alice Alexandra Moore."
	/>
	<meta
		name="twitter:image"
		content="https://ik.imagekit.io/tempoimmaterial/studio/illustrations/still%20across%20the%20waters?tr=w-750"
	/>
	<meta name="twitter:image:alt" content="The illustrations page of alicealexandra.com." />
</svelte:head>

<svelte:window on:keydown={handleWindowKeydown} />

<div class="background">
	<div class="art-grid">
		{#each paintings as painting, i}
			{@const imageUrl = painting.imageUrl}
			{@const name = painting.name}
			{@const date = painting.date}
			<button
				type="button"
				class="grid-item"
				on:click={() => openModal(painting)}
				aria-label={name ? `Open ${name}` : 'Open artwork'}
				style="--delay: {i * 0.1}s"
				in:scale={{
					duration: 800,
					delay: i * 100,
					easing: (t) => t * (2 - t)
				}}
			>
				<div class="image-wrapper">
					<img
						src={imageUrl + lowQualityParams}
						alt={name}
						class="grid-image"
						loading="lazy"
						on:load={handleImageLoad}
					/>
					<div class="image-overlay">
						<h3>{name}</h3>
						<p class="date">{date}</p>
					</div>
				</div>
			</button>
		{/each}
	</div>

	{#if modalOpen && selectedPainting}
		{@const selectedImageUrl = selectedPainting.imageUrl}
		{@const selectedName = selectedPainting.name}
		{@const selectedDate = selectedPainting.date}
		{@const selectedDescription = selectedPainting.description}
		<div class="modal-overlay" transition:fade={{ duration: 300 }}>
			<button type="button" class="modal-backdrop" on:click={closeModal} aria-label="Close modal"
			></button>
			<div
				class="modal-content"
				role="dialog"
				aria-modal="true"
				aria-label={selectedName}
				transition:scale={{ duration: 300 }}
			>
				<img
					src={selectedImageUrl + (highResImageLoaded ? highQualityParams : lowQualityParams)}
					alt={selectedName}
					class="modal-image"
					style="opacity: {highResImageLoaded ? 1 : 0.99}"
				/>
				<div class="modal-info">
					<h2>{selectedName}</h2>
					<p class="date"><em>{selectedDate}</em></p>
					<p class="description">{selectedDescription}</p>
				</div>
				<button class="close-button" on:click={closeModal}>×</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.background {
		background-color: var(--color-bg);
		padding: 1rem;
		min-height: 100vh;
		color: var(--color-text);
	}

	.art-grid {
		column-gap: 1.5rem;
		columns: 1;
		margin: 0 auto;
		padding: 1rem;
		width: 100%;
		max-width: 1800px;
	}

	.grid-item {
		display: block;
		break-inside: avoid;
		transform-origin: center;
		opacity: 0;
		animation: fadeIn 0.5s ease forwards;
		animation-delay: var(--delay);
		cursor: pointer;
		margin-bottom: 1.5rem;
		border: none;
		background: transparent;
		padding: 0;
		width: 100%;
		text-align: left;
	}

	.grid-item:focus-visible {
		outline: var(--a11y-focus-width) solid var(--a11y-focus-color);
		outline-offset: calc(var(--a11y-focus-offset) + 2px);
	}

	.grid-item:focus-visible .image-wrapper {
		transform: translateY(-4px) scale(1.02);
		box-shadow:
			0 0 0 2px color-mix(in srgb, var(--color-text) 55%, transparent),
			0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.image-wrapper {
		position: relative;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		overflow: hidden;
	}

	.image-wrapper:hover {
		transform: translateY(-4px) scale(1.02);
	}

	.grid-image {
		display: block;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		width: 100%;
		height: auto;
	}

	.image-overlay {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		transform: translateY(100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
		padding: 1.5rem;
	}

	.image-wrapper:hover .image-overlay {
		transform: translateY(0);
	}

	.image-overlay h3 {
		margin: 0;
		color: white;
		font-weight: 500;
		font-size: 1.2rem;
	}

	.image-overlay .date {
		margin: 0.5rem 0 0;
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.9rem;
	}

	@keyframes fadeIn {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@media (min-width: 640px) {
		.art-grid {
			columns: 2;
		}
	}

	@media (min-width: 1024px) {
		.art-grid {
			columns: 3;
		}
	}

	@media (min-width: 1280px) {
		.art-grid {
			columns: 4;
		}
	}

	@media (min-width: 1536px) {
		.art-grid {
			columns: 5;
		}
	}

	.modal-overlay {
		display: flex;
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		background-color: rgba(0, 0, 0, 0.95);
		padding: 2rem;
		overflow-y: auto;
	}

	.modal-backdrop {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		cursor: pointer;
		border: none;
		background: transparent;
		padding: 0;
	}

	.modal-backdrop:focus-visible {
		outline: var(--a11y-focus-width) solid var(--a11y-focus-color);
		outline-offset: -4px;
	}

	.modal-content {
		display: flex;
		position: relative;
		flex-direction: column;
		align-items: center;
		z-index: 1;
		backdrop-filter: blur(10px);
		border-radius: 12px;
		background-color: var(--color-bg);
		padding: 2rem;
		max-width: 90vw;
		max-height: 90vh;
		color: var(--color-text);
	}

	.modal-image {
		transition: opacity 0.3s ease;
		border-radius: 4px;
		max-width: 100%;
		max-height: 70vh;
		object-fit: contain;
	}

	.modal-info {
		margin-top: 1.5rem;
		width: 100%;
		max-width: 600px;
		text-align: center;
	}

	.modal-info h2 {
		margin-bottom: 0.5rem;
		color: var(--color-text);
		font-size: 1.75rem;
	}

	.modal-info .date em {
		opacity: 0.9;
		margin: 1rem 0;
		color: var(--color-text-muted);
		font-style: italic;
		font-size: 1.1rem;
	}

	.modal-info .description {
		color: var(--color-text);
		line-height: 1.6;
		text-align: left;
		white-space: pre-line;
	}

	.close-button {
		display: flex;
		position: absolute;
		top: 1rem;
		right: 1rem;
		justify-content: center;
		align-items: center;
		transition: background-color 0.2s ease;
		cursor: pointer;
		border: none;
		border-radius: 50%;
		background-color: color-mix(in srgb, var(--color-bg) 90%, transparent);
		width: 2.5rem;
		height: 2.5rem;
		color: var(--color-text);
		font-size: 1.5rem;
	}

	.close-button:hover {
		background-color: color-mix(in srgb, var(--color-bg) 82%, transparent);
	}
</style>
