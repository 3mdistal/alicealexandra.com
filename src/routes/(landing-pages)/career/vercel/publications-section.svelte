<script lang="ts">
	import type { Publication } from '$lib/content/career';

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
					<a href={publication.link} target="_blank" rel="noopener noreferrer" class="publication-link">
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
		margin-bottom: 5rem;
		box-shadow: var(--shadow-1);
		border-radius: var(--radius-3);
		background-color: var(--color-surface);
		padding: 2.5rem;
		transition: box-shadow var(--duration-normal) var(--ease-standard);
	}

	.publications-section:hover {
		box-shadow: var(--shadow-2);
	}

	.section-title {
		margin-bottom: 1rem;
		color: var(--publication-accent, var(--color-accent));
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-2xl);
		font-family: var(--font-serif);
	}

	.subtitle {
		margin-bottom: 2.5rem;
		color: var(--color-text-muted);
		font-style: italic;
		font-size: var(--font-size-lg);
		line-height: var(--line-height-body);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.publication-item {
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 1.5rem;
	}

	.publication-item:last-child {
		margin-bottom: 0;
		border-bottom: none;
		padding-bottom: 0;
	}

	.publication-link {
		display: block;
		transition: all 0.3s ease;
		border-radius: var(--radius-2);
		padding: 1rem;
		margin: -1rem;
		text-decoration: none;
	}

	.publication-link:hover {
		transform: translateY(-2px);
		background-color: var(--color-surface-muted);
	}

	.item-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.item-title {
		transition: color 0.2s ease;
		margin: 0;
		color: var(--color-text);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-lg);
		font-family: var(--font-serif);
		line-height: var(--line-height-tight);
	}

	.publication-link:hover .item-title {
		color: var(--publication-accent, var(--color-accent));
	}

	.item-date {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.description {
		margin: 0 0 1rem 0;
		color: var(--color-text-muted);
		font-style: italic;
		font-size: var(--font-size-base);
		line-height: var(--line-height-body);
	}

	.read-more {
		display: inline-flex;
		align-items: center;
		color: var(--publication-accent, var(--color-accent));
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-sm);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.8;
		transition: opacity 0.2s ease;
	}

	.publication-link:hover .read-more {
		opacity: 1;
	}

	.arrow {
		margin-left: 0.25rem;
		transition: transform 0.2s ease;
	}

	.publication-link:hover .arrow {
		transform: translateX(4px);
	}

	@media (min-width: 640px) {
		.publications-section {
			padding: 3rem;
		}

		.item-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: baseline;
		}

		.item-date {
			flex-shrink: 0;
			margin-left: 1rem;
		}
	}

	@media (min-width: 768px) {
		.section-title {
			font-size: var(--font-size-3xl);
		}

		.item-title {
			font-size: var(--font-size-xl);
		}
	}
</style>
