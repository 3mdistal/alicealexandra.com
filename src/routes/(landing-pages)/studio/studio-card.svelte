<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { accentColors, backgroundColors } from '$lib/stores';
	import Button from '$lib/icons/button.svelte';
	import TextMacro from '$lib/notion/components/text-macro.svelte';
	import type { PageObjectResponse } from '$lib/notion/types/notion-types';

	// Card Data
	export let card: PageObjectResponse;

	let {
		properties: {
			Title: {
				title: [{ plain_text: title }]
			},
			Subtitle: subtitle,
			'Shortened Logo Text': logo,
			Image: { url: src },
			ImageAlt: {
				rich_text: [
					{
						text: { content: alt }
					}
				]
			},
			Description: description,
			ButtonText: {
				rich_text: [
					{
						text: { content: buttonText }
					}
				]
			},
			Destination: { url }
		}
	} = card as unknown as {
		properties: {
			Title: {
				title: [{ plain_text: string }];
			};
			// eslint-disable-next-line
			Subtitle: any;
			// eslint-disable-next-line
			'Shortened Logo Text': any;
			Image: { url: string };
			ImageAlt: {
				rich_text: [
					{
						text: { content: string };
					}
				];
			};
			// eslint-disable-next-line
			Description: any;
			ButtonText: {
				rich_text: [
					{
						text: { content: string };
					}
				];
			};
			Destination: { url: string };
		};
	};

	// UI Elements
	let front: HTMLDivElement;
	let back: HTMLDivElement;
	let backText: HTMLParagraphElement;
	let spinPoles: HTMLDivElement;

	// State Variables
	let loading = false;
	let frontOrBack = 'front';

	// Animation Timelines
	function seeBackTimeline() {
		// Animation sequence for showing the back of the card
		const tl = gsap.timeline();
		tl.to(back, { scale: 1, duration: 0.01 })
			.to(front, { scale: 0.96, duration: 0.1, ease: 'power4.easeIn' }, '<')
			.to(back, { scale: 0.96, duration: 0.1, ease: 'power4.easeIn' }, '<')
			.to(front, { rotateY: '180deg', ease: 'power4.easeOut' }, '<')
			.to(front, { opacity: 0, duration: 0.2, ease: 'power4.easeIn' }, '<')
			.to(back, { rotateY: '0deg', ease: 'power4.easeIn' }, '<')
			.to(back, { opacity: 1, duration: 0.2, ease: 'power4.easeOut' }, '<')
			.to(back, { scale: 1, duration: 0.3, ease: 'power3.easeOut' }, '< .15')
			.to(front, { scale: 1, duration: 0.3, ease: 'power3.easeOut' }, '<')
			.to(backText, { opacity: 1 }, '<');

		return tl.paused(true);
	}

	function seeBackTimelineMotionReduced() {
		const tl = gsap.timeline();
		tl.to(back, { scale: 1, duration: 0 })
			.to(spinPoles, { opacity: 0, duration: 0 })
			.to(back.children, { opacity: 0, duration: 0 })
			.to(back, { rotateY: '0deg', duration: 0 })
			.to(back, { opacity: 1 }, '<')
			.to(front.children, { opacity: 0 }, '<')
			.to(back.children, { opacity: 1 });

		return tl.paused(true);
	}

	function hideBackTimeline() {
		// Animation sequence for hiding the back of the card
		const tl = gsap.timeline();
		tl.to(front, { scale: 0.9, duration: 0.2, ease: 'power4.easeOut' })
			.to(back, { scale: 0.9, duration: 0.2, ease: 'power4.easeOut' }, '<')
			.to(front, { rotateY: '0deg', duration: 0.3 }, 0.15)
			.to(front, { opacity: 1, duration: 0.2 }, '<')
			.to(back, { rotateY: '-180deg', duration: 0.2, ease: 'power4.easeOut' }, '<')
			.to(back, { opacity: 0, duration: 0.2 }, '<')
			.to(backText, { opacity: 0, duration: 0.1 }, '<')
			.to(back, { scale: 1, duration: 0.05, ease: 'power4.easeIn' }, 0.2)
			.to(front, { scale: 1, duration: 0.1, ease: 'power4.easeIn' }, '<')
			.to(back, { scale: 0.01, duration: 0.1 });

		return tl.paused(true);
	}

	function hideBackTimelineMotionReduced() {
		const tl = gsap.timeline();
		tl.to(back.children, { opacity: 0 })
			.to(front.children, { opacity: 1 })
			.to(front.querySelector('.opacity-80'), { opacity: 0.8 }, '<')
			.to(back, { opacity: 0 }, '<')
			.to(back, { scale: 0.01, duration: 0 });

		return tl.paused(true);
	}

	// Event Handlers
	let prefersReducedMotion: MediaQueryList;

	function reset() {
		// Reset the card to its initial state
		const tl = gsap.timeline();
		tl.to(back, { rotateY: '-180deg' }, '<')
			.to(back, { opacity: 0, duration: 0.2 }, '<')
			.to(backText, { opacity: 0, duration: 0 }, '<');

		return tl;
	}

	function seeBack() {
		// Show the back of the card
		if (frontOrBack === 'back') return;
		frontOrBack = 'back';

		if (loading === true) return;

		if (prefersReducedMotion.matches) {
			seeBackTimelineMotionReduced().play();
			return;
		}

		seeBackTimeline().play();
		return;
	}

	function hideBack() {
		// Hide the back of the card
		if (frontOrBack === 'front') return;
		frontOrBack = 'front';

		if (loading === true) return;

		if (prefersReducedMotion.matches) {
			hideBackTimelineMotionReduced().play();
			return;
		}

		setTimeout(() => hideBackTimeline().play(), 200);
		return;
	}

	function handleClickMessage(e) {
		// Handle click events from the button
		loading = e.detail.click;
	}

	function handleFocusMessage(e) {
		// Handle focus events from the button
		if (e.detail.focus === true) {
			seeBack();
		} else if (e.detail.focus === false) {
			hideBack();
		}
	}

	// Lifecycle Events
	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		reset().play();
	});
</script>

<div
	on:mouseenter={seeBack}
	on:mouseleave={hideBack}
	role="button"
	tabindex="0"
	aria-live="polite"
	aria-expanded="false"
	class="studio-card"
	style={`--studio-bg-color: ${$accentColors.studio}; --studio-accent-color: ${$backgroundColors.studio}`}
>
	<!-- Front of Card -->
	<div class="card-front" bind:this={front}>
		<div class="logo-container">
			<p class="logo-text"><TextMacro type={logo} /></p>
		</div>
		<div class="title-container">
			<h2>{title}</h2>
			<p><em><TextMacro type={subtitle} /></em></p>
		</div>
		<img {src} {alt} class="background-image" />
		<div class="gradient-overlay"></div>
	</div>

	<!-- Back of Card -->
	<div class="card-back" bind:this={back} aria-labelledby="popover" aria-expanded="true">
		<p bind:this={backText} class="description">
			<em><TextMacro type={description} /></em>
		</p>

		{#if loading}
			<Button
				text="please hold..."
				accent={$accentColors.studio}
				background={$backgroundColors.studio}
			/>
		{:else}
			<Button
				{url}
				text={buttonText}
				accent={$backgroundColors.studio}
				background={$accentColors.studio}
				on:clickMessage={handleClickMessage}
				on:focusMessage={handleFocusMessage}
			/>
		{/if}
	</div>

	<!-- Spin Poles -->
	<div bind:this={spinPoles} class="spin-poles">
		<div class="pole pole-bottom"></div>
		<div class="pole pole-top"></div>
	</div>
</div>

<style>
	.studio-card {
		display: flex;
		position: relative;
		justify-content: center;
		cursor: default;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		border: 2px solid white;
		border-radius: 1.5rem;
		aspect-ratio: 2/3;
		width: 20rem;
		overflow: hidden;
	}

	.card-front,
	.card-back {
		display: flex;
		position: absolute;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border-radius: 1.5rem;
		background-color: var(--studio-bg-color);
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.card-front {
		gap: 4rem;
	}

	.card-back {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		opacity: 0;
		box-sizing: border-box;
		padding: 6rem 3rem;
	}

	.logo-container {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		z-index: 10;
		border: 2px solid white;
		border-radius: 50%;
		background-color: var(--studio-bg-color);
		width: 4.5rem;
		height: 4.5rem;
	}

	.logo-text {
		color: white;
		font-weight: 500;
		font-size: 2.75rem;
		font-family: 'Euphoria Script', cursive;
	}

	.title-container {
		z-index: 10;
	}

	.title-container h2 {
		margin-bottom: 1.5rem;
		color: white;
		font-weight: 300;
		font-size: 2.25rem;
		letter-spacing: 0.15em;
		text-align: center;
	}

	.title-container p {
		font-size: 1.5rem;
		text-align: center;
	}

	.title-container em {
		color: white;
	}

	.background-image {
		position: absolute;
		opacity: 0.8;
		width: 100%;
		height: 100%;
	}

	.gradient-overlay {
		position: absolute;
		opacity: 0.8;
		background: linear-gradient(to top, var(--studio-bg-color), transparent);
		width: 100%;
		height: 100%;
	}

	.description {
		margin-bottom: 2rem;
		max-width: 100%;
		font-size: 1.5rem;
		text-align: center;
	}

	.description em {
		color: white;
	}

	.spin-poles {
		display: flex;
		position: relative;
		z-index: -20;
		height: 100%;
	}

	.pole {
		background-color: var(--studio-bg-color);
		width: 0.25rem;
		height: 5%;
	}

	.pole-bottom {
		align-self: flex-end;
	}

	.pole-top {
		align-self: flex-start;
	}

	@media (min-width: 640px) {
		.card-back {
			padding: 2.5rem 1rem;
		}
	}
</style>
