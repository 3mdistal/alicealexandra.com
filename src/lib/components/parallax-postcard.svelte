<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	interface Props {
		title: string;
		description?: string;
		heroImage?: string;
		href: string;
	}

	let { title, description, heroImage, href }: Props = $props();

	let cardElement: HTMLElement;
	let imageElement: HTMLElement;
	let scrollTriggerInstance: ScrollTrigger;

	onMount(() => {
		// Register GSAP plugins
		gsap.registerPlugin(ScrollTrigger);

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

			const handleMouseEnter = () => {
				gsap.to(postcard, {
					y: -8,
					scale: 1.02,
					duration: 0.4,
					ease: 'back.out(1.7)'
				});
				gsap.to(postcard, {
					boxShadow: '0 25px 50px rgba(255, 255, 255, 0.15)',
					duration: 0.4,
					ease: 'power2.out'
				});
			};

			const handleMouseLeave = () => {
				gsap.to(postcard, {
					y: 0,
					scale: 1,
					duration: 0.6,
					ease: 'power3.out'
				});
				gsap.to(postcard, {
					boxShadow: '0 0px 0px rgba(255, 255, 255, 0)',
					duration: 0.6,
					ease: 'power2.out'
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
	});
</script>

<a
	{href}
	class="postcard-link"
	bind:this={cardElement}
>
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
		text-decoration: none;
		color: inherit;
		width: 100%;
	}

	.postcard {
		position: relative;
		width: 100%;
		aspect-ratio: 3 / 2;
		border-radius: 16px;
		overflow: hidden;
		cursor: pointer;
		background: #000;
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
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		will-change: transform;
		transform: scale(1.15);
	}

	.postcard-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			135deg,
			rgba(0, 0, 0, 0.8) 0%,
			rgba(0, 0, 0, 0.3) 50%,
			rgba(0, 0, 0, 0.9) 100%
		);
		display: flex;
		align-items: flex-end;
		padding: 2rem;
		z-index: 2;
	}

	.postcard-content {
		color: white;
		width: 100%;
	}

	h2 {
		margin: 0 0 1rem 0;
		font-size: 1.8rem;
		font-weight: 600;
		line-height: 1.2;
		color: white;
	}

	.description {
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		line-height: 1.5;
		font-size: 1rem;
		display: -webkit-box;
		-webkit-line-clamp: 3;
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
			font-size: 0.9rem;
			-webkit-line-clamp: 2;
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
