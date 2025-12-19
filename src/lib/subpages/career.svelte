<script lang="ts">
	export let accent: string;
	export let background: string;
</script>

<div class="spacer"></div>
<div class="career-container" style="--bg-color: {background}; --accent-color: {accent}">
	<div class="hero">
		<div class="hero-text">
			<p class="accent-color">Developer notes and explorations.</p>
		</div>
	</div>
	<div class="spacer"></div>
	<div class="content">
		<div class="section">
			<h2 class="accent-color">Featured Work</h2>
			<div class="work-link">
				<a href="/career/builderio">
					<h3 class="accent-color">Work from Builder.io →</h3>
					<p>Content and technical writing from my current role at Builder.io (2025-present)</p>
				</a>
			</div>
			<div class="work-link">
				<a href="/career/vercel">
					<h3 class="accent-color">Work from Vercel →</h3>
					<p>Content and technical writing from my time at Vercel (2022-2025)</p>
				</a>
			</div>
		</div>

		<div class="section">
			<h2 class="accent-color">Coming Soon</h2>
			<p>
				This space will house technical notes, code explorations, and digital experiments.
			</p>
			<p>
				From development techniques to creative coding experiments, this will be a place
				for sharing the process behind the work.
			</p>
		</div>
	</div>
</div>

<style>
	.career-container {
		max-width: 100vw;
		overflow: hidden;
		background-color: var(--bg-color, transparent);
	}

	.accent-color {
		color: var(--accent-color);
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
		background-color: #f4efea;
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
		background-color: var(--bg-color, transparent);
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

	.work-link {
		background-color: #f4efea;
		border-radius: 10px;
		padding: 2rem;
		margin-bottom: 2rem;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		border: 2px solid transparent;
	}

	.work-link:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(100, 46, 26, 0.15);
		border-color: rgba(100, 46, 26, 0.2);
	}

	.work-link a {
		text-decoration: none;
		display: block;
	}

	.work-link h3 {
		font-size: 1.5rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
		transition: color 0.2s ease;
	}

	.work-link:hover h3 {
		text-decoration: underline;
	}

	.work-link p {
		color: #666;
		margin: 0;
		font-style: italic;
	}

	.spacer {
		height: 8rem;
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

		.work-link {
			padding: 2.5rem;
		}

		.work-link h3 {
			font-size: 1.75rem;
		}
	}
</style>
