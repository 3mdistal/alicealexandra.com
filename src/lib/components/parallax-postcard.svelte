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
	let isHovered = $state(false);
	let parallaxTween: gsap.core.Tween;

	onMount(() => {
		// Register GSAP plugins
		gsap.registerPlugin(ScrollTrigger);

		// Create parallax effect for the background image
		if (imageElement && cardElement) {
			parallaxTween = gsap.to(imageElement, {
				yPercent: -20,
				ease: 'none',
				scrollTrigger: {
					trigger: cardElement,
					start: 'top bottom',
					end: 'bottom top',
					scrub: true,
					markers: false
				}
			});
		}

		// Cleanup function
		return () => {
			ScrollTrigger.getAll().forEach(trigger => {
				if (trigger.trigger === cardElement) {
					trigger.kill();
				}
			});
		};
	});

	// Handle hover to temporarily override parallax
	function handleMouseEnter() {
		isHovered = true;
		if (imageElement) {
			gsap.to(imageElement, {
				yPercent: -10,
				duration: 0.4,
				ease: 'power2.out',
				overwrite: false
			});
		}
	}

	function handleMouseLeave() {
		isHovered = false;
		// Let the ScrollTrigger take over again
		if (parallaxTween && parallaxTween.scrollTrigger) {
			parallaxTween.scrollTrigger.refresh();
		}
	}
</script>

<a
	{href}
	class="postcard-link"
	bind:this={cardElement}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
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
		transition: transform 0.4s ease, box-shadow 0.4s ease;
		cursor: pointer;
		background: #000;
	}

	.postcard-link:hover .postcard {
		transform: translateY(-8px) scale(1.02);
		box-shadow: 0 25px 50px rgba(255, 255, 255, 0.15);
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
