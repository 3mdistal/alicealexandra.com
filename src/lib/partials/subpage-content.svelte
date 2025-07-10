<script lang="ts">
	import gsap from 'gsap';
	import { loadScrollTrigger } from '$lib/partials/load-scroll-trigger';
	import { onMount } from 'svelte';

	export let flexDirection = 'row-reverse';
	export let accent = '';
	export let imageSource;
	export let imageAlt = '';

	let container: HTMLElement;
	let heading: HTMLElement;
	let text: HTMLElement;
	let image: HTMLElement;

	function animate(sti: any) {
		gsap.registerPlugin(sti);

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: container,
				scrub: 1,
				end: `bottom 80%`,
				start: `top ${calcHeight()}`
			}
		});
		tl.from(heading, { opacity: 0, y: -50, delay: 0.25 });
		tl.from(text.children, { opacity: 0, y: 50, stagger: 0.25 });
		tl.from(image, { opacity: 0, scale: 1.2, duration: 1, ease: 'power2.in' }, '<');

		return tl;
	}

	function calcHeight() {
		if (window.innerWidth <= 768) {
			return container.offsetHeight - 450;
		}
		return container.offsetHeight;
	}

	let scrollTriggerInstance;

	onMount(async () => {
		scrollTriggerInstance = await loadScrollTrigger();
		animate(scrollTriggerInstance);
	});
</script>

<div class="container" bind:this={container}>
	<h2 bind:this={heading} style="color: {accent}">
		<slot name="heading" />
	</h2>
				<div class="content" style="--flex-direction: {flexDirection}">
		<div class="text" bind:this={text}>
			<slot name="text" style="color: {accent}" />
			<div class="button-container">
				<slot name="button" class="button" />
			</div>
		</div>

						<div class="image-container" bind:this={image}>
			{#if typeof imageSource === 'string' && (imageSource.startsWith('http') || imageSource.startsWith('//'))}
				<img src={imageSource} alt={imageAlt} />
			{:else}
				<enhanced:img src={imageSource} alt={imageAlt} />
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		margin-right: auto;
		margin-left: auto;
		width: 75%;
	}

	h2 {
		text-align: left;
	}

	h2 :global(*) {
		color: inherit;
	}

			.content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2em;
	}

	.text {
		max-width: min(60ch, 50%);
		text-align: left;

		@media screen and (max-width: 1024px) {
			max-width: 100%;
		}
	}

	.text :global(*) {
		margin-bottom: 2.5rem;
	}

	.text :global(*:last-child) {
		margin-bottom: 0;
	}

	.button-container {
		display: flex;
		justify-content: center;
		margin-top: 3em;
	}

			.image-container {
		margin-right: auto;
		margin-left: auto;
		height: 50vh;
		min-height: 300px;
	}

				@media (max-width: 1023px) {
		.image-container {
			position: relative;
			overflow: visible;
		}

		.image-container img,
		.image-container :global(img) {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			width: 100vw !important;
			max-width: 100vw !important;
			margin-left: 0 !important;
			margin-right: 0 !important;
		}
	}

					.image-container img,
	.image-container :global(img) {
		display: block;
		border-radius: 1.5rem;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
				overflow: hidden;
		filter: grayscale(0.1);
												
	}

				@media (min-width: 1024px) {
		h2 {
			text-align: center;
		}

		.content {
			gap: 3em;
			flex-direction: var(--flex-direction, row-reverse) !important;
		}

		.image-container {
			position: sticky;
			top: 7.5vh;
			height: 85vh;
			max-width: 50%;
		}

				.image-container {
			max-width: 50%;
		}
	}
</style>
