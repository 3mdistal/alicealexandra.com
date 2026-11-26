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
		padding: var(--space-96) var(--space-32) var(--space-64);
		text-align: center;
	}

	.hero-content {
		margin: 0 auto;
		border-radius: var(--radius-16);
		background-color: var(--color-surface);
		padding: var(--space-48);
		max-width: 800px;
	}

	h1 {
		margin-bottom: var(--space-16);
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
		padding: var(--space-64) var(--space-32);
		max-width: 900px;
	}

	.placeholder {
		box-shadow: var(--shadow-1);
		border-radius: var(--radius-8);
		background-color: var(--color-surface);
		padding: var(--space-48);
		text-align: center;
	}

	.placeholder p {
		margin: 0 0 var(--space-24);
		color: var(--color-text-muted);
		font-size: var(--font-size-18);
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
		border-radius: var(--radius-8);
		background-color: var(--color-surface);
		padding: var(--space-8) var(--space-20);
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
		margin-top: var(--space-32);
		border-top: 1px solid var(--color-border);
		padding: var(--space-32);
		text-align: center;
	}

	.back-link {
		display: inline-block;
		transition: all 0.2s ease;
		border: 2px solid var(--color-accent);
		border-radius: var(--radius-8);
		background-color: var(--color-surface);
		padding: var(--space-8) var(--space-16);
		color: var(--color-accent);
		font-weight: 500;
		font-size: var(--font-size-16);
		text-decoration: none;
	}

	.back-link:hover {
		transform: translateX(-2px);
		background-color: var(--color-accent);
		color: var(--color-surface);
	}

	@media (min-width: 768px) {
		.hero {
			padding: var(--space-128) var(--space-64) var(--space-96);
		}

		.content {
			padding: var(--space-96) var(--space-64);
		}

		.placeholder {
			--placeholder-padding: 3.5rem;
			padding: var(--placeholder-padding);
		}
	}
</style>
