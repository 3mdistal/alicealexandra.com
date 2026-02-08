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
	let filteredPublications: Publication[] = [];

	$: filteredPublications = publications.filter((publication) => publication.type === type);
</script>

<section class="publications-section">
	<h2 class="section-title">{title}</h2>
	<p class="subtitle">{subtitle}</p>
	<ul>
		{#each filteredPublications as publication}
			<li>
				<a href={publication.link} target="_blank" rel="noopener noreferrer">
					<h3 class="item-title">
						{publication.name}
					</h3>
				</a>
				{#if publication.description}
					<p class="description">{publication.description}</p>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	.publications-section {
		margin-bottom: var(--space-9);
		box-shadow: var(--shadow-1);
		border-radius: var(--radius-3);
		background-color: var(--color-surface);
		padding: var(--space-7);
	}

	.section-title {
		margin-bottom: var(--space-4);
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
		font-size: 2rem;
	}

	.subtitle {
		margin-bottom: var(--space-7);
		color: var(--color-text-muted);
		font-style: italic;
		font-size: 1.125rem;
		line-height: var(--line-height-body);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		margin-bottom: var(--space-6);
		border-bottom: 1px solid var(--color-border);
		padding-bottom: var(--space-5);
	}

	li:last-child {
		margin-bottom: 0;
		border-bottom: none;
	}

	a {
		display: block;
		transition: transform var(--duration-base) var(--ease-standard);
		text-decoration: none;
	}

	a:hover {
		transform: translateX(var(--space-2));
	}

	.item-title {
		transition: color var(--duration-base) var(--ease-standard);
		margin-bottom: var(--space-2);
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
		font-size: 1.25rem;
	}

	a:hover .item-title {
		filter: brightness(1.2);
		text-decoration: underline;
	}

	.description {
		margin: 0;
		color: var(--color-text-muted);
		font-style: italic;
		font-size: 1rem;
		line-height: var(--line-height-body);
	}

	@media (min-width: 640px) {
		.publications-section {
			padding: 3rem;
		}

		.section-title {
			font-size: 2.25rem;
		}

		.subtitle {
			font-size: 1.25rem;
		}

		.item-title {
			font-size: 1.375rem;
		}

		.description {
			font-size: 1.125rem;
		}
	}

	@media (min-width: 768px) {
		.section-title {
			font-size: 2.5rem;
		}

		.item-title {
			font-size: 1.5rem;
		}
	}
</style>
