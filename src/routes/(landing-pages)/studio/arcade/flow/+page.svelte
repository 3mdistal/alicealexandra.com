<script lang="ts">
	import { onMount } from 'svelte';
	import { FlowField, Particle } from './flow';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	let field: FlowField;
	let particles: Particle[] = [];
	let lastTimestamp = 0;
	let mouseX = 0;
	let mouseY = 0;
	let frameCount = 0;
	let baseHue = Math.random() * 360;

	const MAX_PARTICLES = 1200;
	const SPAWN_RATE = 4; // particles per frame (ambient)

	function spawnAmbient() {
		if (particles.length >= MAX_PARTICLES) return;
		for (let i = 0; i < SPAWN_RATE; i++) {
			const x = Math.random() * canvas.width;
			const y = Math.random() * canvas.height;
			// Hue drifts slowly over time so the palette shifts
			const hue = (baseHue + x * 0.08 + y * 0.04) % 360;
			particles.push(new Particle(x, y, hue));
		}
	}

	function spawnBurst(x: number, y: number, count: number) {
		for (let i = 0; i < count; i++) {
			if (particles.length >= MAX_PARTICLES) break;
			const offsetX = x + (Math.random() - 0.5) * 80;
			const offsetY = y + (Math.random() - 0.5) * 80;
			const hue = (baseHue + offsetX * 0.08 + offsetY * 0.04) % 360;
			particles.push(new Particle(offsetX, offsetY, hue));
		}
	}

	function animate(timestamp: number) {
		const deltaTime = Math.min(timestamp - lastTimestamp, 50); // cap at 50ms to avoid spiral of death
		lastTimestamp = timestamp;
		frameCount++;

		// Slow hue drift
		baseHue = (baseHue + 0.08) % 360;

		// Fade the canvas slightly each frame — creates trailing effect
		ctx.fillStyle = 'rgba(8, 6, 18, 0.18)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		field.update(deltaTime);

		// Spawn ambient particles
		spawnAmbient();

		// Spawn a few near the mouse periodically
		if (frameCount % 3 === 0) {
			spawnBurst(mouseX, mouseY, 2);
		}

		// Update and draw particles
		particles = particles.filter((p) => !p.isDead(canvas.width, canvas.height));
		for (const p of particles) {
			p.update(field);
			p.draw(ctx);
		}

		requestAnimationFrame(animate);
	}

	function handleMouseMove(e: MouseEvent) {
		mouseX = e.clientX;
		mouseY = e.clientY;
	}

	function handleClick(e: MouseEvent) {
		spawnBurst(e.clientX, e.clientY, 80);
	}

	function handleResize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		field.resize(canvas.width, canvas.height);
		// Refill the background so resize doesn't leave a white flash
		ctx.fillStyle = 'rgb(8, 6, 18)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		ctx.fillStyle = 'rgb(8, 6, 18)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		field = new FlowField(canvas.width, canvas.height, 22);

		// Seed with an initial burst across the whole canvas
		for (let i = 0; i < 300; i++) {
			particles.push(
				new Particle(Math.random() * canvas.width, Math.random() * canvas.height)
			);
		}

		requestAnimationFrame(animate);
	});
</script>

<svelte:window on:resize={handleResize} />

<div class="scene">
	<canvas
		bind:this={canvas}
		on:mousemove={handleMouseMove}
		on:click={handleClick}
	></canvas>
	<p class="hint">move your mouse &nbsp;·&nbsp; click to burst</p>
</div>

<style>
	.scene {
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: rgb(8, 6, 18);
	}

	canvas {
		display: block;
	}

	.hint {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		color: rgba(255, 255, 255, 0.25);
		font-size: 0.85rem;
		letter-spacing: 0.08em;
		pointer-events: none;
		user-select: none;
	}
</style>
