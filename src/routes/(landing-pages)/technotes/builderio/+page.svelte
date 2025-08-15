<script lang="ts">
	const accent = '#642e1a';
	const background = '#dcc9c6';
</script>

<svelte:head>
	<title>Builder.io Work | Technotes</title>
	<meta name="description" content="Work and content from Alice Alexandra Moore's time at Builder.io." />
</svelte:head>

<main style="background-color: {background}">
	<div class="hero">
		<div class="hero-content">
			<h1 style="color: {accent}">
				Work from <span class="highlight">Builder.io</span>
			</h1>
			<p class="subtitle">
				Content coming soon from my current role at Builder.io (2025-present).
			</p>
		</div>
	</div>
	
	<div class="content">
		<div class="placeholder">
			<h2 style="color: {accent}">Coming Soon</h2>
			<p>This page will showcase content and technical writing from my work at Builder.io.</p>
		</div>
	</div>
	
	<div class="footer">
		<a href="/technotes" class="back-link">← Back to Technotes</a>
	</div>
</main>

<style>
	main {
		min-height: 100vh;
		font-family: 'Spectral', serif;
	}

	.hero {
		background: linear-gradient(135deg, #642e1a 0%, #8b4513 100%);
		padding: 6rem 2rem 4rem;
		text-align: center;
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
		background-color: #f8f5f2;
		border-radius: 15px;
		padding: 3rem;
	}

	h1 {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 500;
		margin-bottom: 1rem;
		line-height: 1.2;
	}

	.highlight {
		color: #642e1a;
		font-weight: 500;
		font-family: 'Spectral', serif;
	}

	.subtitle {
		font-size: clamp(1.1rem, 2.5vw, 1.4rem);
		color: #555;
		font-style: italic;
		margin: 0;
	}

	.content {
		padding: 4rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.placeholder {
		background-color: #f8f5f2;
		border-radius: 10px;
		padding: 3rem;
		text-align: center;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.placeholder h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.placeholder p {
		font-size: 1.125rem;
		color: #666;
		margin: 0;
	}

	.footer {
		padding: 2rem;
		text-align: center;
		border-top: 1px solid rgba(100, 46, 26, 0.2);
		margin-top: 2rem;
	}

	.back-link {
		display: inline-block;
		color: #642e1a;
		text-decoration: none;
		font-size: 1rem;
		font-weight: 500;
		padding: 0.5rem 1rem;
		border: 2px solid #642e1a;
		border-radius: 8px;
		transition: all 0.2s ease;
		background-color: #f8f5f2;
	}

	.back-link:hover {
		background-color: #642e1a;
		color: white;
		transform: translateX(-2px);
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
