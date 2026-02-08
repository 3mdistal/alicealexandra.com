<script lang="ts">
	export let title = '';
	export let highlight = '';
	export let subtitle = '';
	export let backHref = '/career';
	export let backLabel = 'Back to Career';
	export let contentMaxWidth = '75rem';
</script>

<main
	class="career-detail-surface"
	style={contentMaxWidth ? `--career-content-max-width: ${contentMaxWidth}` : ''}
>
	<header class="hero">
		<div class="hero-card">
			<h1>
				{#if title}
					{title}
					{#if highlight}
						<span class="highlight"> {highlight}</span>
					{/if}
				{:else}
					<slot name="title" />
				{/if}
			</h1>
			{#if subtitle}
				<p class="subtitle">{subtitle}</p>
			{:else}
				<slot name="subtitle" />
			{/if}
		</div>
	</header>

	<div class="content">
		<slot />
	</div>

	<footer class="footer">
		<a href={backHref} class="back-link">&larr; {backLabel}</a>
	</footer>
</main>

<style>
	.career-detail-surface {
		background-color: var(--color-bg);
		min-height: 100vh;
	}

	.hero {
		background: linear-gradient(135deg, var(--color-accent), var(--color-accent-strong));
		padding: var(--space-9) var(--space-6) var(--space-8);
		text-align: center;
	}

	.hero-card {
		margin: 0 auto;
		box-shadow: var(--shadow-1);
		border-radius: var(--radius-3);
		background-color: var(--color-surface);
		padding: var(--space-8);
		max-width: 50rem;
	}

	h1 {
		margin-bottom: var(--space-4);
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
		font-size: clamp(var(--font-size-2xl), 5vw, 3.5rem);
		line-height: var(--line-height-tight);
	}

	.highlight {
		color: var(--color-accent-strong);
	}

	.subtitle {
		margin: 0;
		color: var(--color-text-muted);
		font-size: clamp(1.1rem, 2.5vw, 1.4rem);
		line-height: var(--line-height-body);
	}

	.content {
		margin: 0 auto;
		padding: var(--space-8) var(--space-6);
		max-width: var(--career-content-max-width, 75rem);
	}

	.footer {
		margin-top: var(--space-6);
		border-top: 1px solid var(--color-border);
		padding: var(--space-6);
		text-align: center;
	}

	.back-link {
		display: inline-block;
		transition:
			background-color var(--duration-base) var(--ease-standard),
			color var(--duration-base) var(--ease-standard),
			transform var(--duration-base) var(--ease-standard);
		border: 2px solid var(--color-accent);
		border-radius: var(--radius-2);
		background-color: var(--color-surface);
		padding: var(--space-3) var(--space-5);
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-base);
		text-decoration: none;
	}

	.back-link:hover {
		transform: translateX(calc(var(--space-1) * -1));
		background-color: var(--color-accent);
		color: var(--color-surface);
	}

	@media (min-width: 768px) {
		.hero {
			padding: calc(var(--space-9) + var(--space-8)) var(--space-8) var(--space-9);
		}

		.content {
			padding: var(--space-9) var(--space-8);
		}
	}

	@media (min-width: 1024px) {
		.content {
			padding: calc(var(--space-9) + var(--space-8)) var(--space-9);
		}
	}
</style>
