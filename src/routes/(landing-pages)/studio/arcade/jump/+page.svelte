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

	const circle = new MovingCircle(100, 100, 50, 'white');

	function animate(timeStamp: number) {
		const deltaTime = timeStamp - lastTimeStamp;
		lastTimeStamp = timeStamp;

		ctxBackground.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

		circle.draw(ctxBackground);
		circle.move(inputHandler, deltaTime);

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
</div>

<style>
	.game-container {
		background-color: black;
		width: 100vw;
		height: 100vh;
	}
</style>
