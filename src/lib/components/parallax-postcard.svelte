<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	interface Props {
		title: string;
		description?: string;
		heroImage?: string | undefined;
		href: string;
		initialRotation?: number;
		slug?: string;
		onclick?: (e: MouseEvent) => void;
	}

	let { title, description, heroImage, href, initialRotation = 0, onclick }: Props = $props();

	let cardElement: HTMLElement;
	let imageElement: HTMLElement;
	let scrollTriggerInstance: ScrollTrigger;
	// svelte-ignore state_referenced_locally
	// Initialize with prop value - intentionally capturing initial value
	let currentRotation = $state(initialRotation);

	onMount(() => {
		// Register GSAP plugins
		gsap.registerPlugin(ScrollTrigger);

		// Apply initial rotation from prop
		if (cardElement && initialRotation !== 0) {
			gsap.set(cardElement, { rotation: initialRotation });
			currentRotation = initialRotation;
		}

		// Create parallax effect for the background image with reduced range
		if (imageElement && cardElement) {
			scrollTriggerInstance = ScrollTrigger.create({
				trigger: cardElement,
				start: 'top bottom',
				end: 'bottom top',
				scrub: true,
				markers: false,
				animation: gsap.to(imageElement, {
					yPercent: -10,
					ease: 'none'
				})
			});
		}

		// GSAP hover animations
		if (cardElement) {
			const postcard = cardElement.querySelector('.postcard');

			// Function to generate a new random rotation
			const generateNewRotation = () => {
				let newRotation: number;
				let attempts = 0;

				do {
					newRotation = (Math.random() - 0.5) * 16; // -8 to 8 degrees
					attempts++;
				} while (Math.abs(newRotation - currentRotation) < 4 && attempts < 10); // Ensure at least 4 degrees difference

				return newRotation;
			};

			const handleMouseEnter = () => {
				gsap.to(postcard, {
					y: -8,
					scale: 1.02,
					duration: 0.4,
					ease: 'back.out(1.7)'
				});
				gsap.to(postcard, {
					boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
					duration: 0.4,
					ease: 'power2.out'
				});
				// Scale background image to 100% and center it
				gsap.to(imageElement, {
					scale: 1,
					duration: 0.4,
					ease: 'power2.out'
				});
				// Rotate card to 0 degrees (straighten)
				gsap.to(cardElement, {
					rotation: 0,
					duration: 0.4,
					ease: 'power2.out'
				});
			};

			const handleMouseLeave = () => {
				// Generate a new random rotation for this card
				const newRotation = generateNewRotation();
				currentRotation = newRotation;

				gsap.to(postcard, {
					y: 0,
					scale: 1,
					duration: 0.6,
					ease: 'power3.out'
				});
				gsap.to(postcard, {
					boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
					duration: 0.6,
					ease: 'power2.out'
				});
				// Scale background image back to 1.15 for parallax room
				gsap.to(imageElement, {
					scale: 1.15,
					duration: 0.6,
					ease: 'power3.out'
				});
				// Rotate card to NEW random angle
				gsap.to(cardElement, {
					rotation: newRotation,
					duration: 0.6,
					ease: 'power3.out'
				});
			};

			cardElement.addEventListener('mouseenter', handleMouseEnter);
			cardElement.addEventListener('mouseleave', handleMouseLeave);

			// Cleanup function
			return () => {
				cardElement.removeEventListener('mouseenter', handleMouseEnter);
				cardElement.removeEventListener('mouseleave', handleMouseLeave);
				if (scrollTriggerInstance) {
					scrollTriggerInstance.kill();
				}
			};
		}
		return () => {};
	});
</script>

<a {href} class="postcard-link" bind:this={cardElement} {onclick} data-sveltekit-preload-data>
	<article class="postcard">
		<div class="image-container">
			<div
				class="background-image"
				bind:this={imageElement}
				style="background-image: url('{heroImage || 'https://unsplash.it/800/1000'}')"
			></div>
		</div>
		<div class="postcard-overlay">
			<div class="postcard-content">
				<h2>{title}</h2>
				{#if description}
					<p class="description">{description}</p>
				{/if}
			</div>
		</div>
	</article>
</a>

<style>
	.postcard-link {
		display: block;
		width: 100%;
		--postcard-paper: var(--color-content-bg);
		--postcard-ink: var(--color-content-text);
		--postcard-ink-muted: var(--color-content-secondary);
		--postcard-border: var(--color-content-border);
		color: inherit;
		text-decoration: none;

		&:hover {
			filter: none;
		}
	}

	.postcard {
		position: relative;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border-radius: 16px;
		background: var(--postcard-paper);
		aspect-ratio: 3 / 2;
		width: 100%;
		overflow: hidden;
	}

	.postcard::before {
		position: absolute;
		top: -2px;
		right: -2px;
		bottom: -2px;
		left: -2px;
		z-index: -1;
		border: 2px dotted color-mix(in srgb, var(--postcard-border) 70%, transparent);
		border-radius: 18px;
		pointer-events: none;
		content: '';
	}

	.image-container {
		position: absolute;
		top: -10%;
		left: 0;
		width: 100%;
		height: 120%;
		overflow: hidden;
	}

	.background-image {
		transform: scale(1.15);
		will-change: transform;
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		width: 100%;
		height: 100%;
	}

	.postcard-overlay {
		display: flex;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		align-items: flex-end;
		z-index: 2;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, transparent 90%, var(--postcard-paper)) 0%,
			color-mix(in srgb, transparent 70%, var(--postcard-paper)) 30%,
			color-mix(in srgb, transparent 25%, var(--postcard-paper)) 70%,
			var(--postcard-paper) 100%
		);
		padding: 2rem;
	}

	.postcard-content {
		width: 100%;
		color: var(--postcard-ink);
	}

	h2 {
		margin: 0 0 1rem 0;
		color: var(--postcard-ink);
		font-weight: 600;
		font-size: 1.8rem;
		line-height: 1.2;
	}

	.description {
		display: -webkit-box;
		margin: 0;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		color: var(--postcard-ink-muted);
		font-size: 1rem;
		line-height: 1.5;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@media (max-width: 768px) {
		.postcard-overlay {
			padding: 1.5rem;
		}

		h2 {
			font-size: 1.5rem;
		}

		.description {
			-webkit-line-clamp: 2;
			line-clamp: 2;
			font-size: 0.9rem;
		}
	}

	@media (max-width: 480px) {
		.postcard-overlay {
			padding: 1.25rem;
		}

		h2 {
			font-size: 1.3rem;
		}
	}
</style>
