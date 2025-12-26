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
	export let accent: string = '#642e1a';
</script>

<section class="publications-section" style="--accent-color: {accent}">
	<h2 class="section-title">{title}</h2>
	<p class="subtitle">{subtitle}</p>
	<ul>
		{#each publications as publication}
			{#if publication.type === type}
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
			{/if}
		{/each}
	</ul>
</section>

<style>
	.publications-section {
		margin-bottom: 5rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border-radius: 10px;
		background-color: #f4efea;
		padding: 2.5rem;
	}

	.section-title {
		margin-bottom: 1rem;
		color: var(--accent-color);
		font-weight: 500;
		font-size: 2rem;
		font-family: 'Spectral', serif;
	}

	.subtitle {
		margin-bottom: 2.5rem;
		color: #666;
		font-style: italic;
		font-size: 1.125rem;
		line-height: 1.6;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		margin-bottom: 2rem;
		border-bottom: 1px solid rgba(100, 46, 26, 0.2);
		padding-bottom: 1.5rem;
	}

	li:last-child {
		margin-bottom: 0;
		border-bottom: none;
	}

	a {
		display: block;
		transition: transform 0.2s ease;
		text-decoration: none;
	}

	a:hover {
		transform: translateX(5px);
	}

	.item-title {
		transition: color 0.2s ease;
		margin-bottom: 0.5rem;
		color: var(--accent-color);
		font-weight: 500;
		font-size: 1.25rem;
		font-family: 'Spectral', serif;
	}

	a:hover .item-title {
		filter: brightness(1.2);
		text-decoration: underline;
	}

	.description {
		margin: 0;
		color: #555;
		font-style: italic;
		font-size: 1rem;
		line-height: 1.5;
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
