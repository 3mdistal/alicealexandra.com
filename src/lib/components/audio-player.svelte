<script lang="ts">
	let { src, loop = true }: { src?: string | undefined; loop?: boolean | undefined } = $props();

	let audio = $state<HTMLAudioElement>();
	let isPlaying = $state(false);

	function toggle() {
		if (!audio) return;
		if (isPlaying) {
			audio.pause();
		} else {
			audio.play();
		}
		isPlaying = !isPlaying;
	}
</script>

{#if src}
	<audio bind:this={audio} {src} {loop}></audio>
	<button onclick={toggle} class="audio-toggle" aria-label="Toggle Audio">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			{#if isPlaying}
				<rect x="6" y="4" width="4" height="16" fill="currentColor" />
				<rect x="14" y="4" width="4" height="16" fill="currentColor" />
			{:else}
				<path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
			{/if}
		</svg>
	</button>
{/if}

<style>
	.audio-toggle {
		display: flex;
		position: fixed;
		right: 2rem;
		bottom: 2rem;
		justify-content: center;
		align-items: center;
		z-index: 100;
		backdrop-filter: blur(4px);
		transition: all 0.3s ease;
		cursor: pointer;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.6);
		width: 3.5rem;
		height: 3.5rem;
		color: white;
	}

	.audio-toggle:hover {
		transform: scale(1.05);
		background: rgba(0, 0, 0, 0.8);
	}

	.audio-toggle:focus {
		outline: none;
		border-color: white;
	}
</style>
