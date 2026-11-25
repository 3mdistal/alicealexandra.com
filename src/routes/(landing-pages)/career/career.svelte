<div class="career-container" id="content">
	<div class="spacer"></div>
	<div class="content">
		<div class="section">
			<h2 class="accent-color">Featured Work</h2>
			<div class="work-link">
				<a href="/career/builder">
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
	</div>
</div>

<style>
	.career-container {
		background-color: var(--color-bg);
		max-width: 100vw;
		overflow: hidden;
	}

	.accent-color {
		color: var(--color-accent);
	}

	.content {
		margin: 0 auto;
		background-color: var(--color-bg);
		padding: var(--space-64) var(--space-32);
		max-width: 800px;
	}

	.section {
		margin-bottom: var(--space-48);

		& h2 {
			margin-bottom: var(--space-16);
			font-size: var(--font-size-32);
		}

		& p {
			margin-bottom: var(--space-24);
			font-size: 1.125rem;
			line-height: 1.6;
		}
	}

	.work-link {
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		margin-bottom: var(--space-32);
		border: 2px solid transparent;
		border-radius: 10px;
		background-color: var(--color-surface);
		padding: var(--space-32);
	}

	.work-link:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-2);
		border-color: var(--color-border);
	}

	.work-link a {
		display: block;
		text-decoration: none;
	}

	.work-link h3 {
		transition: color 0.2s ease;
		margin-bottom: var(--space-8);
		font-weight: 500;
		font-size: var(--font-size-24);
	}

	.work-link:hover h3 {
		text-decoration: underline;
	}

	.work-link p {
		margin: 0;
		color: var(--color-text-muted);
		font-style: italic;
	}

	.spacer {
		height: 8rem;
	}

	@media (min-width: 768px) {
		.content {
			padding: var(--space-96) var(--space-64);
		}

		.section h2 {
			font-size: var(--font-size-40);
		}

		.section p {
			font-size: var(--font-size-20);
		}

		.work-link {
			padding: 2.5rem;
		}

		.work-link h3 {
			font-size: 1.75rem;
		}
	}
</style>
