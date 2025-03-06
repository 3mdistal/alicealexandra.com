<script lang="ts">
	import { animate, staggerAnimate } from '../index';

	// State variables with runes
	let staggerContainer = $state<HTMLElement | undefined>(undefined);
	let showStaggered = $state(false);

	// Toggle visibility for the staggered boxes
	const toggleStaggered = () => {
		showStaggered = !showStaggered;
	};
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
	}

	.action-examples {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.box {
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
</style>
