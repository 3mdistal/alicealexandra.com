<script lang="ts">
	import { animate, staggerAnimate } from '../index';
	import { GSAPService } from '../gsap-service';

	// State variables with runes
	let staggerContainer = $state<HTMLElement | undefined>(undefined);
	let showStaggered = $state(false);
	let timelineProgress = $state(0);
	let timelineContainer = $state<HTMLElement | undefined>(undefined);
	let scrollContainer = $state<HTMLElement | undefined>(undefined);
	let timeline: any = $state(undefined);

	// Toggle visibility for the staggered boxes
	const toggleStaggered = () => {
		showStaggered = !showStaggered;
	};

	// Create and control a GSAP timeline with runes
	$effect(() => {
		if (!timelineContainer) return;

		const initTimeline = async () => {
			const gsapService = GSAPService.getInstance();
			const gsap = await gsapService.loadGSAP();

			// Create a new timeline
			timeline = gsap.timeline({ paused: true });

			// Add animations to the timeline
			timeline.from('.timeline-box:nth-child(1)', {
				x: -100,
				opacity: 0,
				duration: 0.7,
				ease: 'power2.out'
			});

			timeline.from(
				'.timeline-box:nth-child(2)',
				{
					y: 50,
					opacity: 0,
					duration: 0.7,
					ease: 'back.out(1.7)'
				},
				'-=0.4'
			);

			timeline.from(
				'.timeline-box:nth-child(3)',
				{
					scale: 0.5,
					opacity: 0,
					duration: 0.7,
					ease: 'elastic.out(1, 0.5)'
				},
				'-=0.4'
			);
		};

		initTimeline();

		// Cleanup function
		return () => {
			if (timeline) {
				timeline.kill();
			}
		};
	});

	// Control timeline progress with runes
	$effect(() => {
		if (timeline) {
			timeline.progress(timelineProgress);
		}
	});

	// Set up scroll-triggered animation with runes
	$effect(() => {
		if (!scrollContainer) return;

		const setupScrollTrigger = async () => {
			const gsapService = GSAPService.getInstance();
			const gsap = await gsapService.loadGSAP();
			const ScrollTrigger = await gsapService.loadPlugin('ScrollTrigger');

			// Create scroll-triggered animation
			gsap.from('.scroll-item', {
				y: 50,
				opacity: 0,
				duration: 0.8,
				stagger: 0.2,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: scrollContainer,
					start: 'top 80%',
					end: 'bottom 20%',
					toggleActions: 'play none none reverse'
					// markers: true, // Uncomment for debugging
				}
			});
		};

		setupScrollTrigger();
	});
</script>

<div class="animation-examples">
	<h2>Animation Examples</h2>

	<section>
		<h3>Svelte Action Examples</h3>

		<div class="action-examples">
			<div
				class="box"
				use:animate={{
					animation: 'fadeIn',
					duration: 1,
					delay: 0.2
				}}
			>
				Fade In Action
			</div>

			<div
				class="box"
				use:animate={{
					animation: 'slideInRight',
					distance: 150,
					duration: 0.8,
					delay: 0.5 // Added delay to simulate timeline sequence
				}}
			>
				Slide In Action
			</div>

			<div
				class="box"
				use:animate={{
					animation: 'scaleIn',
					scale: 0.3,
					duration: 1.2,
					delay: 0.8 // Added delay to simulate timeline sequence
				}}
			>
				Scale In Action
			</div>
		</div>
	</section>

	<section>
		<h3>Staggered Animation Example</h3>
		<button onclick={toggleStaggered}>
			{showStaggered ? 'Hide' : 'Show'} Staggered Items
		</button>

		{#if showStaggered}
			<ul
				class="stagger-container"
				bind:this={staggerContainer}
				use:staggerAnimate={{
					animation: 'fadeIn',
					childSelector: 'li',
					staggerAmount: 0.15,
					duration: 0.7
				}}
			>
				<li>Item 1</li>
				<li>Item 2</li>
				<li>Item 3</li>
				<li>Item 4</li>
				<li>Item 5</li>
			</ul>
		{/if}
	</section>

	<section>
		<h3>Timeline Animation with Runes</h3>
		<p>Drag the slider to control the timeline progress:</p>

		<input
			type="range"
			min="0"
			max="1"
			step="0.01"
			bind:value={timelineProgress}
			class="timeline-slider"
		/>

		<div class="timeline-container" bind:this={timelineContainer}>
			<div class="timeline-box">First animation</div>
			<div class="timeline-box">Second animation</div>
			<div class="timeline-box">Third animation</div>
		</div>
	</section>

	<section>
		<h3>ScrollTrigger Animation with Runes</h3>
		<p>Scroll down to see the animation:</p>

		<div class="scroll-container" bind:this={scrollContainer}>
			<div class="scroll-item">Scroll Item 1</div>
			<div class="scroll-item">Scroll Item 2</div>
			<div class="scroll-item">Scroll Item 3</div>
			<div class="scroll-item">Scroll Item 4</div>
		</div>
	</section>
</div>

<style>
	.animation-examples {
		margin: 0 auto;
		padding: 2rem;
		max-width: 800px;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	h2 {
		margin-bottom: 2rem;
		text-align: center;
	}

	h3 {
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	section {
		margin-bottom: 3rem;
		border-bottom: 1px solid #eaeaea;
		padding-bottom: 2rem;
	}

	.action-examples {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.box,
	.timeline-box,
	.scroll-item {
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border-radius: 0.5rem;
		background-color: #4a5568;
		padding: 1.5rem;
		width: 150px;
		color: white;
		text-align: center;
	}

	button {
		cursor: pointer;
		margin-top: 1rem;
		border: none;
		border-radius: 0.25rem;
		background-color: #4299e1;
		padding: 0.5rem 1rem;
		color: white;
		font-size: 1rem;
	}

	button:hover {
		background-color: #3182ce;
	}

	.stagger-container {
		margin-top: 1rem;
		padding: 0;
		list-style-type: none;
	}

	.stagger-container li {
		margin-bottom: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border-radius: 0.25rem;
		background-color: #4a5568;
		padding: 1rem;
		color: white;
	}

	.timeline-slider {
		margin: 1rem 0;
		width: 100%;
	}

	.timeline-container {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}

	.scroll-container {
		margin-top: 1rem;
		border: 1px solid #eaeaea;
		border-radius: 0.5rem;
		padding: 1rem;
		height: 300px;
		overflow-y: auto;
	}

	.scroll-item {
		margin-bottom: 1rem;
		width: auto;
	}
</style>
