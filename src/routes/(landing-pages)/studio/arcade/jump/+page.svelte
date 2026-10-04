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

	<button class="parameters-button" on:click={toggleParameters}> Parameters </button>

	{#if showInstructions}
		<div class="instructions">
			<h3>Controls</h3>
			<div class="control-list">
				<div class="control-item">
					<span class="keys">WASD</span> or <span class="keys">Arrow Keys</span> - Move
				</div>
				<div class="control-item">
					<span class="keys">Spacebar</span> or <span class="keys">Z</span> - Jump
				</div>
				<div class="hint">Hold jump longer for higher jumps!</div>
			</div>
		</div>
	{/if}

	<ParametersPanel bind:isOpen={showParameters} />
</div>

<style>
	.game-container {
		position: relative;
		background-color: black;
		width: 100vw;
		height: 100vh;
	}

	.parameters-button {
		position: fixed;
		top: 20px;
		left: 20px;
		z-index: 1001;
		transition: all 0.2s ease;
		cursor: pointer;
		border: 2px solid #333;
		border-radius: 8px;
		background: rgba(0, 0, 0, 0.8);
		padding: 10px 20px;
		color: white;
		font-size: 14px;
		font-family: monospace;
	}

	.parameters-button:hover {
		border-color: #555;
		background: rgba(50, 50, 50, 0.9);
	}

	.parameters-button:active {
		transform: scale(0.95);
	}

	.instructions {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 999;
		animation: fadeIn 0.5s ease-in;
		border: 2px solid #333;
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.9);
		padding: 30px;
		color: white;
		font-family: monospace;
		text-align: center;
	}

	.instructions h3 {
		margin: 0 0 20px 0;
		color: #fff;
		font-size: 18px;
		font-family: monospace;
	}

	.control-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		font-family: monospace;
	}

	.control-item {
		color: #ccc;
		font-size: 14px;
		font-family: monospace;
	}

	.keys {
		border: 1px solid #555;
		border-radius: 4px;
		background: #333;
		padding: 4px 8px;
		color: #fff;
		font-weight: bold;
		font-family: monospace;
	}

	.hint {
		margin-top: 8px;
		color: #888;
		font-style: italic;
		font-size: 12px;
		font-family: monospace;
	}

	@keyframes fadeIn {
		from {
			transform: translate(-50%, -50%) scale(0.9);
			opacity: 0;
		}
		to {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
	}
</style>
