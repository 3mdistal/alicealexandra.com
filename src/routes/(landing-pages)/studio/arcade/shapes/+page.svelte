<script lang="ts">
	import { onMount } from 'svelte';
	import { Triangle, Circle, Square, Heart, Star, Clear } from '$lib/arcade/shapes';
	import { ADSR } from '$lib/arcade/notes';

	const sidebarShapes = [
		{ id: 'triangle', Shape: Triangle },
		{ id: 'circle', Shape: Circle },
		{ id: 'square', Shape: Square },
		{ id: 'heart', Shape: Heart },
		{ id: 'star', Shape: Star },
		{ id: 'clear', Shape: Clear }
	] as const;

	type SidebarShapeId = (typeof sidebarShapes)[number]['id'];

	let canvasBackground: HTMLCanvasElement;
	let ctxBackground: CanvasRenderingContext2D;

	let currentShape: SidebarShapeId = sidebarShapes[0].id;

	const sidebarCanvases: Array<HTMLCanvasElement | null> = Array(sidebarShapes.length).fill(null);
	const sidebarContexts: Array<CanvasRenderingContext2D | null> = Array(sidebarShapes.length).fill(null);

	const audioContext = new AudioContext();

	function registerSidebarCanvas(node: HTMLCanvasElement, index: number) {
		sidebarCanvases[index] = node;
		sidebarContexts[index] = node.getContext('2d');

		return {
			destroy() {
				sidebarCanvases[index] = null;
				sidebarContexts[index] = null;
			}
		};
	}

	function resetDimensions() {
		if (!canvasBackground) return;
		canvasBackground.width = window.innerWidth;
		canvasBackground.height = window.innerHeight;
	}

	function checkWindowWidth() {
		return window.innerWidth < 768 ? 'mobile' : 'desktop';
	}

	function handleClick(e: MouseEvent) {
		if (currentShape === 'clear') return;

		const size = checkWindowWidth() === 'mobile' ? 50 : 100;
		const shapeEntry = sidebarShapes.find((shape) => shape.id === currentShape);
		if (!shapeEntry) return;

		const shapeInstance = new shapeEntry.Shape(
			e.offsetX,
			e.offsetY,
			size,
			`hsl(${Math.random() * 360}, 50%, 50%)`
		);
		shapeInstance.draw(ctxBackground);
	}

	function getFrequency(referenceFreq: number, stepsFromReference: number) {
		const a = Math.pow(2, 1 / 12); // twelfth root of 2
		return referenceFreq * Math.pow(a, stepsFromReference);
	}

	const frequencies = [
		440,
		getFrequency(440, 2),
		getFrequency(440, 4),
		getFrequency(440, 5),
		getFrequency(440, 7),
		getFrequency(440, -12)
	];

	function playNote(keyMultiplier: number) {
		const shapeIndex = sidebarShapes.findIndex((shape) => shape.id === currentShape);
		const frequency = frequencies[shapeIndex];
		if (!frequency) return;

		const soundEffect = new ADSR(audioContext, 'sine', frequency * keyMultiplier, 0, 0.5, 0.005);
		soundEffect.play();
	}

	function handleMouseDown(e: MouseEvent, shape: SidebarShapeId) {
		const canvas = e.target as HTMLCanvasElement;
		canvas.style.transform = 'scale(1)';

		currentShape = shape;
		playNote(0.63);
	}

	function handleMouseUp(e: MouseEvent) {
		const canvas = e.target as HTMLCanvasElement;
		canvas.style.transform = 'scale(1.05)';

		const shapeIndex = sidebarShapes.findIndex((shape) => shape.id === currentShape);
		const shapeEntry = sidebarShapes[shapeIndex];
		const context = sidebarContexts[shapeIndex];
		const currentCanvas = sidebarCanvases[shapeIndex];

		if (!shapeEntry || !context || !currentCanvas) return;

		const color = currentShape !== 'clear' ? `hsl(0, 0%, 80%)` : `hsl(0, 50%, 50%)`;
		const shapeInstance = new shapeEntry.Shape(
			currentCanvas.width / 2,
			currentCanvas.height / 2,
			checkWindowWidth() === 'mobile' ? 50 : 100,
			color
		);
		shapeInstance.draw(context);

		if (currentShape === 'clear') {
			ctxBackground.clearRect(0, 0, canvasBackground.width, canvasBackground.height);
		}
	}

	function handleMouseEnter(e: MouseEvent) {
		const canvas = e.target as HTMLCanvasElement;
		canvas.style.transform = 'scale(1.05)';
	}

	function handleMouseLeave(e: MouseEvent) {
		const canvas = e.target as HTMLCanvasElement;
		canvas.style.transform = 'scale(1)';
	}

	function initializeSidebar() {
		sidebarShapes.forEach((shape, index) => {
			const currentCanvas = sidebarCanvases[index];
			const context = sidebarContexts[index];

			if (!currentCanvas || !context) return;

			const color = shape.id !== 'clear' ? `hsl(0, 0%, 80%)` : `hsl(0, 50%, 50%)`;
			const shapeInstance = new shape.Shape(
				currentCanvas.width / 2,
				currentCanvas.height / 2,
				checkWindowWidth() === 'mobile' ? 50 : 100,
				color
			);
			shapeInstance.draw(context);
		});
	}

	function scale(node: HTMLCanvasElement) {
		if (window.innerWidth < 768) {
			node.width = 50;
			node.height = 50;
		}
	}

	onMount(() => {
		resetDimensions();
		ctxBackground = canvasBackground.getContext('2d')!;
		initializeSidebar();
	});
</script>

<svelte:window on:resize={resetDimensions} />

<canvas class="background-canvas" on:click={handleClick} bind:this={canvasBackground}></canvas>

<div class="sidebar">
	{#each sidebarShapes as shape, index}
		<canvas
			use:registerSidebarCanvas={index}
			class="sidebar-canvas"
			class:last-canvas={index === sidebarShapes.length - 1}
			on:mousedown={(e) => handleMouseDown(e, shape.id)}
			on:mouseup={handleMouseUp}
			on:mouseenter={handleMouseEnter}
			on:mouseleave={handleMouseLeave}
			use:scale
			width="100"
			height="100"
		></canvas>
	{/each}
</div>

<style>
	.background-canvas {
		background-color: black;
	}

	.sidebar {
		display: flex;
		position: absolute;
		top: 0;
		left: 0;
		flex-direction: column;
		justify-content: center;
		gap: 2.5rem;
		background-color: #222222;
		padding-right: 1rem;
		padding-left: 1rem;
		height: 100vh;
	}

	.sidebar-canvas {
		cursor: pointer;
	}

	.last-canvas {
		margin-top: 5rem;
	}

	@media (min-width: 768px) {
		.sidebar {
			padding-right: 2rem;
			padding-left: 2rem;
		}
	}
</style>
