<script lang="ts">
	export let accent: string;
	export let background: string;
</script>

<div class="spacer"></div>
<div class="technotes-container">
	<div class="hero">
		<div class="hero-text">
			<p style="color: {accent}">Technical notes and explorations.</p>
		</div>
	</div>
	<div class="spacer"></div>
	<div class="content">
		<div class="section">
			<h2 style="color: {accent}">Coming Soon</h2>
			<p>
				This space will house technical notes, code explorations, and digital experiments. 
				Think of it as a digital lab notebook where ideas take shape and evolve.
			</p>
			<p>
				From development techniques to creative coding experiments, this will be a place 
				for sharing the process behind the work.
			</p>
		</div>
	</div>
</div>

<style>
	.technotes-container {
		max-width: 100vw;
		overflow: hidden;
	}

	.hero {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		background: linear-gradient(135deg, #642e1a 0%, #8b4513 100%);
		width: 100%;
		height: 60vh;
		overflow: hidden;
	}

	.hero-text {
		z-index: 100;
		margin: 0 2em;
		border-radius: 10px;
		background-color: rgba(255, 255, 255, 0.9);
		padding: 3em;

		& p {
			font-size: clamp(1.5rem, 3vw, 3rem);
			font-family: 'Spectral', serif;
			margin: 0;
		}
	}

	.content {
		padding: 4rem 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.section {
		margin-bottom: 3rem;

		& h2 {
			font-size: 2rem;
			margin-bottom: 1rem;
		}

		& p {
			font-size: 1.125rem;
			line-height: 1.6;
			margin-bottom: 1.5rem;
		}
	}

	.spacer {
		height: 4rem;
	}

	@media (min-width: 768px) {
		.content {
			padding: 6rem 4rem;
		}
		
		.section h2 {
			font-size: 2.5rem;
		}
		
		.section p {
			font-size: 1.25rem;
		}
	}
</style>
