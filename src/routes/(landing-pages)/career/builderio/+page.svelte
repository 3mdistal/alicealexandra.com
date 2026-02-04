<svelte:head>
	<title>Builder.io Work | Career</title>
	<meta name="description" content="This page has moved to the Builder.io career archive." />
	<link rel="canonical" href="https://alicealexandra.com/career/builder" />
</svelte:head>

<main class="career-detail-surface">
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
		background-color: var(--color-bg);
		min-height: 100vh;
		font-family: var(--font-serif);
	}

	.accent-color {
		color: var(--color-accent);
	}

	.hero {
		background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-strong) 100%);
		padding: 6rem 2rem 4rem;
		text-align: center;
	}

	.hero-content {
		margin: 0 auto;
		border-radius: 15px;
		background-color: var(--color-surface);
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
		color: var(--color-accent);
		font-weight: 500;
		font-family: var(--font-serif);
	}

	.subtitle {
		margin: 0;
		color: var(--color-text-muted);
		font-style: italic;
		font-size: clamp(1.1rem, 2.5vw, 1.4rem);
	}

	.content {
		margin: 0 auto;
		padding: 4rem 2rem;
		max-width: 900px;
	}

	.placeholder {
		box-shadow: var(--shadow-1);
		border-radius: 10px;
		background-color: var(--color-surface);
		padding: 3rem;
		text-align: center;
	}

	.placeholder p {
		margin: 0 0 1.5rem;
		color: var(--color-text-muted);
		font-size: 1.125rem;
		line-height: 1.6;
	}

	.inline-link {
		color: var(--color-accent);
		font-weight: 600;
		text-decoration: underline;
	}

	.primary-link {
		display: inline-block;
		transition: all 0.2s ease;
		border: 2px solid var(--color-accent);
		border-radius: 8px;
		background-color: var(--color-surface);
		padding: 0.6rem 1.2rem;
		color: var(--color-accent);
		font-weight: 500;
		text-decoration: none;
	}

	.primary-link:hover {
		transform: translateY(-2px);
		background-color: var(--color-accent);
		color: var(--color-surface);
	}

	.footer {
		margin-top: 2rem;
		border-top: 1px solid var(--color-border);
		padding: 2rem;
		text-align: center;
	}

	.back-link {
		display: inline-block;
		transition: all 0.2s ease;
		border: 2px solid var(--color-accent);
		border-radius: 8px;
		background-color: var(--color-surface);
		padding: 0.5rem 1rem;
		color: var(--color-accent);
		font-weight: 500;
		font-size: 1rem;
		text-decoration: none;
	}

	.back-link:hover {
		transform: translateX(-2px);
		background-color: var(--color-accent);
		color: var(--color-surface);
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
