<script lang="ts">
	const accent = '#642e1a';
	const background = '#dcc9c6';
</script>

<svelte:head>
	<title>Builder.io Work | Career</title>
	<meta name="description" content="This page has moved to the Builder.io career archive." />
	<link rel="canonical" href="https://alicealexandra.com/career/builder" />
</svelte:head>

<main class="career-detail-surface" style="--bg-color: {background}; --accent-color: {accent}">
	<div class="hero">
		<div class="hero-content">
			<h1 class="accent-color">
				Builder.io work moved to <span class="highlight">/career/builder</span>
			</h1>
			<p class="subtitle">Use the updated page for the latest Builder.io posts and writing.</p>
		</div>
	</div>

	<div class="content">
		<div class="placeholder">
			<p>
				The Builder.io archive now lives at
				<a class="inline-link" href="/career/builder">/career/builder</a>.
			</p>
			<a href="/career/builder" class="primary-link">Go to Builder.io work →</a>
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
		font-size: clamp(2rem, 5vw, 3.25rem);
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
		max-width: 900px;
	}

	.placeholder {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border-radius: 10px;
		background-color: #f4efea;
		padding: 2.5rem;
		text-align: center;
	}

	.placeholder p {
		margin-bottom: 1.5rem;
		color: #555;
		font-size: 1.125rem;
		line-height: 1.6;
	}

	.inline-link {
		color: #642e1a;
		font-weight: 600;
		text-decoration: underline;
	}

	.primary-link {
		display: inline-block;
		transition: all 0.2s ease;
		border: 2px solid #642e1a;
		border-radius: 8px;
		background-color: #f4efea;
		padding: 0.6rem 1.2rem;
		color: #642e1a;
		font-weight: 500;
		text-decoration: none;
	}

	.primary-link:hover {
		transform: translateY(-2px);
		background-color: #642e1a;
		color: white;
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
			padding: 3.5rem;
		}
	}
</style>
