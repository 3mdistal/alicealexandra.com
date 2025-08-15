<script lang="ts">
	import type { ProfessionalPublications } from './+page.server';

	type PublicationTypes =
		| 'Landing Page'
		| 'Technical Blog'
		| 'Technical Guide'
		| 'Customer Story'
		| 'Enterprise Resource'
		| 'Product Feature';

	export let publications: Array<ProfessionalPublications>;
	export let title: string;
	export let subtitle: string;
	export let type: PublicationTypes;
	export let accent: string = '#642e1a';

	// Debug: Log all unique types found in the data
	$: {
		if (publications && publications.length > 0) {
			const allTypes = publications.map(pub => pub.properties.Type.select?.name).filter(Boolean);
			const uniqueTypes = [...new Set(allTypes)];
			console.log('All publication types found:', uniqueTypes);
			console.log(`Looking for type: "${type}"`, `Found ${publications.filter(pub => pub.properties.Type.select?.name === type).length} matches`);
		}
	}
</script>

<section>
	<h2 style="color: {accent}">{title}</h2>
	<p class="subtitle">{subtitle}</p>
	<ul>
		{#each publications as publication}
			{#if publication.properties.Type.select.name === type}
				<li>
					<a href={publication.properties.Link.url} target="_blank" rel="noopener noreferrer">
						<h3 style="color: {accent}">
							{publication.properties.Name.title[0].plain_text}
						</h3>
					</a>
					{#if publication.properties.Description.rich_text[0]}
						<p class="description">{publication.properties.Description.rich_text[0].plain_text}</p>
					{/if}
				</li>
			{/if}
		{/each}
	</ul>
</section>

<style>
	section {
		margin-bottom: 5rem;
		background-color: rgba(255, 255, 255, 0.6);
		border-radius: 10px;
		padding: 2.5rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	h2 {
		margin-bottom: 1rem;
		font-size: 2rem;
		font-weight: 500;
		font-family: 'Spectral', serif;
	}

	.subtitle {
		margin-bottom: 2.5rem;
		font-style: italic;
		font-size: 1.125rem;
		color: #666;
		line-height: 1.6;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid rgba(100, 46, 26, 0.2);
	}

	li:last-child {
		border-bottom: none;
		margin-bottom: 0;
	}

	a {
		text-decoration: none;
		display: block;
		transition: transform 0.2s ease;
	}

	a:hover {
		transform: translateX(5px);
	}

	h3 {
		font-weight: 500;
		font-size: 1.25rem;
		margin-bottom: 0.5rem;
		transition: color 0.2s ease;
		font-family: 'Spectral', serif;
	}

	a:hover h3 {
		text-decoration: underline;
		filter: brightness(1.2);
	}

	.description {
		font-style: italic;
		font-size: 1rem;
		color: #555;
		line-height: 1.5;
		margin: 0;
	}

	@media (min-width: 640px) {
		section {
			padding: 3rem;
		}

		h2 {
			font-size: 2.25rem;
		}

		.subtitle {
			font-size: 1.25rem;
		}

		h3 {
			font-size: 1.375rem;
		}

		.description {
			font-size: 1.125rem;
		}
	}

	@media (min-width: 768px) {
		h2 {
			font-size: 2.5rem;
		}

		h3 {
			font-size: 1.5rem;
		}
	}
</style>
