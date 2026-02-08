<script lang="ts">
	import gsap from 'gsap';
	import { loadScrollTrigger } from '$lib/partials/load-scroll-trigger';
	import { onMount } from 'svelte';

	export let flexDirection = 'row-reverse';
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
	<h2 bind:this={heading}>
		<slot name="heading" />
	</h2>
	<div class="content" style="--flex-direction: {flexDirection}">
		<div class="text" bind:this={text}>
			<slot name="text" />
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

	@media (max-width: 767px) {
		.container {
			width: 90%;
		}
	}

	h2 {
		margin-bottom: var(--space-5);
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-2xl);
		line-height: var(--line-height-tight);
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
		gap: var(--space-6);
	}

	.text {
		max-width: min(60ch, 50%);
		font-size: var(--font-size-lg);
		line-height: 1.75;
		text-align: left;

		@media screen and (max-width: 1024px) {
			max-width: 100%;
		}
	}

	.text :global(*) {
		margin-bottom: var(--space-7);
	}

	.text :global(*:last-child) {
		margin-bottom: 0;
	}

	.button-container {
		display: flex;
		justify-content: center;
		margin-top: var(--space-8);
	}

	.image-container {
		margin-right: auto;
		margin-left: auto;
		height: 50vh;
		min-height: 300px;
	}

	.image-container img,
	.image-container :global(img) {
		display: block;
		filter: grayscale(0.1);
		border-radius: var(--radius-4);
		width: 100%;
		height: 100%;
		overflow: hidden;
		object-fit: cover;
		object-position: center;
	}

	@media (min-width: 1024px) {
		h2 {
			font-size: var(--font-size-3xl);
			text-align: center;
		}

		.content {
			flex-direction: var(--flex-direction, row-reverse) !important;
			gap: var(--space-7);
		}

		.text {
			font-size: var(--font-size-xl);
		}

		.image-container {
			position: sticky;
			top: 7.5vh;
			max-width: 50%;
			height: 85vh;
		}

		.image-container {
			max-width: 50%;
		}
	}
</style>
