<script lang="ts">
	import type { Publication } from '#lib/content/career.ts';

	type PublicationTypes =
		| 'Landing Page'
		| 'Technical Blog'
		| 'Technical Guide'
		| 'Customer Story'
		| 'Enterprise Resource'
		| 'Product Feature';

	export let publications: Publication[];
	export let title: string;
	export let subtitle: string;
	export let type: PublicationTypes;
	export let accent: string = 'var(--color-accent)';

	// Helper to format date
	const formatDate = (dateString: string) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
	};
</script>

<section class="publications-section" style={accent ? `--publication-accent: ${accent}` : ''}>
	<h2 class="section-title">{title}</h2>
	<p class="subtitle">{subtitle}</p>
	<ul>
		{#each publications as publication}
			{#if publication.type === type}
				<li class="publication-item">
					<a
						href={publication.link}
						target="_blank"
						rel="noopener noreferrer"
						class="publication-link"
					>
						<div class="item-header">
							<h3 class="item-title">
								{publication.name}
							</h3>
							{#if publication.date}
								<span class="item-date">{formatDate(publication.date)}</span>
							{/if}
						</div>
						{#if publication.description}
							<p class="description">{publication.description}</p>
						{/if}
						<div class="read-more">Read <span class="arrow">→</span></div>
					</a>
				</li>
			{/if}
		{/each}
	</ul>
</section>

<style>
	.publications-section {
		margin-bottom: var(--space-80);
		box-shadow: var(--shadow-2);
		border-radius: var(--radius-12);
		background-color: var(--color-surface);
		padding: var(--space-40);
	}

	.section-title {
		margin-bottom: var(--space-16);
		color: var(--publication-accent, var(--color-accent));
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-32);
		font-family: var(--font-serif);
	}

	.subtitle {
		margin-bottom: var(--space-40);
		color: var(--color-text-muted);
		font-style: italic;
		font-size: var(--font-size-20);
		line-height: var(--line-height-body);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.publication-item {
		margin-bottom: var(--space-24);
		border-bottom: 1px solid var(--color-border);
		padding-bottom: var(--space-24);
	}

	.publication-item:last-child {
		margin-bottom: 0;
		border-bottom: none;
		padding-bottom: 0;
	}

	.publication-link {
		display: block;
		transition: all 0.3s ease;
		margin: calc(-1 * var(--space-16));
		border-radius: var(--radius-8);
		padding: var(--space-16);
		text-decoration: none;
	}

	.publication-link:hover {
		transform: translateY(-2px);
		background-color: var(--color-surface-muted);
	}

	.item-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		margin-bottom: var(--space-8);
	}

	.item-title {
		transition: color 0.2s ease;
		margin: 0;
		color: var(--color-text);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-20);
		line-height: var(--line-height-tight);
		font-family: var(--font-serif);
	}

	.publication-link:hover .item-title {
		color: var(--publication-accent, var(--color-accent));
	}

	.item-date {
		color: var(--color-text-muted);
		font-size: var(--font-size-14);
		font-family: var(--font-mono);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.description {
		margin: 0 0 var(--space-16) 0;
		color: var(--color-text-muted);
		font-style: italic;
		font-size: var(--font-size-16);
		line-height: var(--line-height-body);
	}

	.read-more {
		display: inline-flex;
		align-items: center;
		opacity: 0.8;
		transition: opacity 0.2s ease;
		color: var(--publication-accent, var(--color-accent));
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-14);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.publication-link:hover .read-more {
		opacity: 1;
	}

	.arrow {
		transition: transform 0.2s ease;
		margin-left: var(--space-4);
	}

	.publication-link:hover .arrow {
		transform: translateX(4px);
	}

	@media (min-width: 640px) {
		.publications-section {
			padding: var(--space-48);
		}

		.item-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: baseline;
		}

		.item-date {
			flex-shrink: 0;
			margin-left: var(--space-16);
		}
	}

	@media (min-width: 768px) {
		.section-title {
			font-size: var(--font-size-40);
		}

		.item-title {
			font-size: var(--font-size-24);
		}
	}
</style>
