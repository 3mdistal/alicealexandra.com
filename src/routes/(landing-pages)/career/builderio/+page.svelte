<script lang="ts">
	const accent = '#642e1a';
	const background = '#dcc9c6';
</script>

<svelte:head>
	<title>Builder.io Work | Career</title>
	<meta
		name="description"
		content="Work and content from Alice Alexandra Moore's time at Builder.io."
	/>
</svelte:head>

<main class="career-detail-surface" style="--bg-color: {background}; --accent-color: {accent}">
	<div class="hero">
		<div class="hero-content">
			<h1 class="accent-color">
				Work from <span class="highlight">Builder.io</span>
			</h1>
			<p class="subtitle">Content coming soon from my current role at Builder.io (2025-present).</p>
		</div>
	</div>

	<div class="content">
		<div class="placeholder">
			<h2 class="accent-color">Coming Soon</h2>
			<p>This page will showcase content and technical writing from my work at Builder.io.</p>
		</div>
	</div>

	<div class="footer">
		<a href="/career" class="back-link">← Back to Career</a>
	</div>
</main>

<style>
	.career-detail-surface {
		background-color: var(--bg-color);
		min-height: 100vh;
		font-family: 'Spectral', serif;
	}

	.accent-color {
		color: var(--accent-color);
	}

	.hero {
		background: linear-gradient(135deg, #642e1a 0%, #8b4513 100%);
		padding: 6rem 2rem 4rem;
		text-align: center;
	}

	.hero-content {
		margin: 0 auto;
		border-radius: 15px;
		background-color: #f4efea;
		padding: 3rem;
		max-width: 800px;
	}

	h1 {
		margin-bottom: 1rem;
		font-weight: 500;
		font-size: clamp(2rem, 5vw, 3.5rem);
		line-height: 1.2;
	}

	.highlight {
		color: #642e1a;
		font-weight: 500;
		font-family: 'Spectral', serif;
	}

	.subtitle {
		margin: 0;
		color: #555;
		font-style: italic;
		font-size: clamp(1.1rem, 2.5vw, 1.4rem);
	}

	.content {
		margin: 0 auto;
		padding: 4rem 2rem;
		max-width: 1200px;
	}

	.placeholder {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border-radius: 10px;
		background-color: #f4efea;
		padding: 3rem;
		text-align: center;
	}

	.placeholder h2 {
		margin-bottom: 1rem;
		font-size: 2rem;
	}

	.placeholder p {
		margin: 0;
		color: #666;
		font-size: 1.125rem;
	}

	.footer {
		margin-top: 2rem;
		border-top: 1px solid rgba(100, 46, 26, 0.2);
		padding: 2rem;
		text-align: center;
	}

	.back-link {
		display: inline-block;
		transition: all 0.2s ease;
		border: 2px solid #642e1a;
		border-radius: 8px;
		background-color: #f4efea;
		padding: 0.5rem 1rem;
		color: #642e1a;
		font-weight: 500;
		font-size: 1rem;
		text-decoration: none;
	}

	.back-link:hover {
		transform: translateX(-2px);
		background-color: #642e1a;
		color: white;
	}

	@media (min-width: 768px) {
		.hero {
			padding: 8rem 4rem 6rem;
		}

		.content {
			padding: 6rem 4rem;
		}

		.placeholder {
			padding: 4rem;
		}

		.placeholder h2 {
			font-size: 2.5rem;
		}

		.placeholder p {
			font-size: 1.25rem;
		}
	}

	@media (min-width: 1024px) {
		.content {
			padding: 8rem 6rem;
		}
	}
</style>
