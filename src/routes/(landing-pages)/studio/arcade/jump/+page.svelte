<script lang="ts">
	import { onMount } from 'svelte';
	import { MovingCircle } from '$lib/arcade/shapes';
	import { InputHandler } from '$lib/arcade/input-handling';
	import ParametersPanel from '$lib/components/parameters-panel.svelte';

	let backgroundCanvas: HTMLCanvasElement;
	let ctxBackground: CanvasRenderingContext2D;
		let inputHandler: InputHandler;
	let lastTimeStamp = 0;
	let showParameters = false;
	let showInstructions = true;

	const circle = new MovingCircle(100, 100, 50, 'white');

		function animate(timeStamp: number) {
		const deltaTime = timeStamp - lastTimeStamp;
		lastTimeStamp = timeStamp;

		ctxBackground.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

		circle.draw(ctxBackground);
		circle.move(inputHandler, deltaTime);

		// Hide instructions when any input is detected
		if (showInstructions && inputHandler) {
			const inputs = inputHandler.handleInputs();
			if (inputs.size > 0 || inputHandler.jumpPressed) {
				showInstructions = false;
			}
		}

		requestAnimationFrame(animate);
	}

	function toggleParameters() {
		showParameters = !showParameters;
	}

	onMount(() => {
		ctxBackground = backgroundCanvas.getContext('2d')!;

		backgroundCanvas.width = window.innerWidth;
		backgroundCanvas.height = window.innerHeight;

		inputHandler = new InputHandler(backgroundCanvas);

		animate(0);
	});
</script>

<div class="game-container">
	<canvas bind:this={backgroundCanvas}></canvas>

	<button class="parameters-button" on:click={toggleParameters}>
		Parameters
	</button>

	<ParametersPanel bind:isOpen={showParameters} />
</div>

<style>
	.game-container {
		background-color: black;
		width: 100vw;
		height: 100vh;
		position: relative;
	}

		.parameters-button {
		position: fixed;
		top: 20px;
		left: 20px;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		border: 2px solid #333;
		padding: 10px 20px;
		border-radius: 8px;
		cursor: pointer;
		font-family: monospace;
		font-size: 14px;
		z-index: 1001;
		transition: all 0.2s ease;
	}

	.parameters-button:hover {
		background: rgba(50, 50, 50, 0.9);
		border-color: #555;
	}

	.parameters-button:active {
		transform: scale(0.95);
	}
</style>
