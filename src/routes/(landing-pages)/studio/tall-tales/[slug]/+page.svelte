<script lang="ts">
	import '$lib/styles/prose.css';
	import { marked } from 'marked';
	import AudioPlayer from '$lib/components/audio-player.svelte';
	import LinkButton from '$lib/components/ui/link-button.svelte';

	let { data } = $props();
	const tale = $derived(data.tale);

	const sectionsHTML = $derived(
		tale?.sections.map((s: any) => ({
			...s,
			htmlContent: marked.parse(s.content)
		})) || []
	);
</script>

<svelte:head>
	<title>{tale?.title || 'Tall Tale'}</title>
	<meta name="description" content={tale?.description} />
	<meta name="og:title" content={tale?.title || 'Tall Tale'} />
	<meta name="og:description" content={tale?.description} />
	{#if tale?.coverImage}
		<meta name="og:image" content={tale.coverImage} />
	{/if}
</svelte:head>

<div class="tall-tale-wrapper">
	{#if tale}
		<AudioPlayer src={tale.audio?.src} loop={tale.audio?.loop} />
		{#each sectionsHTML as section, index}
			<section
				class="tall-tale-section parallax"
				style="
					{section.theme.backgroundImage ? `--bg-image: url('${section.theme.backgroundImage}');` : ''}
					--bg-opacity: {section.theme.backgroundImageOpacity ?? 0.4};
					--bg-color: {section.theme.backgroundColor ?? 'transparent'};
					--overlay-color: {section.theme.overlayColor ?? 'rgba(0, 0, 0, 0.6)'};
					--text-color: {section.theme.textColor};
					--font-family: {section.theme.fontFamily ?? 'var(--font-sans)'};
				"
			>
				<div class="section-content prose">
					{#if index === 0}
						<header class="tale-hero">
							<nav class="tale-breadcrumb">
								<a href="/studio/tall-tales" class="tale-breadcrumb-link">
									<svg class="tale-back-icon" viewBox="0 0 16 16" width="16" height="16">
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M6.46966 13.7803L6.99999 14.3107L8.06065 13.25L7.53032 12.7197L3.56065 8.75001H14.25H15V7.25001H14.25H3.56065L7.53032 3.28034L8.06065 2.75001L6.99999 1.68935L6.46966 2.21968L1.39644 7.2929C1.00592 7.68342 1.00592 8.31659 1.39644 8.70711L6.46966 13.7803Z"
											fill="currentColor"
										/>
									</svg>
									<span>Tall Tales</span>
								</a>
							</nav>
							<h1 class="tale-title">{tale.title}</h1>
							{#if tale.description}
								<p class="tale-description">{tale.description}</p>
							{/if}
						</header>
					{/if}
					{@html section.htmlContent}
				</div>
			</section>
		{/each}
	{:else}
		<div class="not-found">
			<h1>Story not found</h1>
			<LinkButton href="/studio/tall-tales" variant="solid" size="md">← Back to Stories</LinkButton>
		</div>
	{/if}
</div>

<style>
	.tall-tale-wrapper {
		/* Reset margin from main layouts if necessary */
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		background: var(--color-bg);
		width: 100vw;
	}

	.tall-tale-section {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		background-color: var(--bg-color, transparent);
		padding: var(--space-9) var(--space-6);
		min-height: 100vh;
		overflow: hidden;
		color: var(--text-color, var(--color-neutral-0));
	}

	.tall-tale-section::before {
		position: absolute;
		opacity: var(--bg-opacity, 0.4);
		z-index: 0;
		inset: 0;
		background-image: var(--bg-image);
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		content: '';
	}

	.tall-tale-section::after {
		position: absolute;
		z-index: 1;
		mix-blend-mode: multiply;
		inset: 0;
		background-color: var(--overlay-color, rgba(0, 0, 0, 0.6));
		content: '';
	}

	.tall-tale-section.parallax::before {
		background-attachment: fixed;
	}

	.section-content {
		position: relative;
		z-index: 2;
		width: 100%;
		max-width: 770px;
		color: var(--text-color);
		font-weight: var(--font-weight-light);
		font-size: var(--content-font-size-body);
		line-height: 1.75rem;
		font-family: var(--font-family);
		text-shadow: none;
	}

	@media (min-width: 1024px) {
		.section-content {
			font-size: var(--content-font-size-body-lg);
			line-height: 2rem;
		}
	}

	/* Override prose.css global theme variables to strictly use our section textColor */
	.section-content :global(p),
	.section-content :global(li),
	.section-content :global(h1),
	.section-content :global(h2),
	.section-content :global(h3),
	.section-content :global(a),
	.section-content :global(strong),
	.section-content :global(em),
	.section-content :global(blockquote) {
		color: var(--text-color) !important;
	}

	.section-content :global(p::first-letter) {
		color: var(--text-color) !important;
	}

	.section-content :global(p) {
		margin-bottom: var(--space-5);
	}

	.tale-breadcrumb {
		display: inline-flex;
		align-items: center;
		margin-bottom: var(--space-4);
	}

	.tale-breadcrumb-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		opacity: 0.7;
		transition: opacity 0.2s;
		color: var(--text-color);
		font-weight: 500;
		font-size: var(--content-font-size-body-sm);
		text-decoration: none;
	}

	.tale-breadcrumb-link:hover {
		opacity: 1;
		text-decoration: underline;
	}

	.tale-back-icon {
		width: 16px;
		min-width: 16px;
		height: 16px;
		color: currentColor;
	}

	.tale-hero {
		margin-bottom: var(--space-8);
		border-bottom: 1px solid color-mix(in srgb, var(--text-color) 20%, transparent);
		padding-bottom: var(--space-6);
		text-align: left;
	}

	.tale-title {
		margin: 0 0 var(--content-space-sm) 0;
		color: var(--text-color);
		font-weight: 500;
		font-size: 2.25rem;
		line-height: 2.5rem;
	}

	@media (min-width: 640px) {
		.tale-title {
			font-size: 3rem;
			line-height: 1;
		}
	}

	@media (min-width: 768px) {
		.tale-title {
			font-size: var(--content-font-size-heading-lg);
			line-height: 1;
		}
	}

	@media (min-width: 1024px) {
		.tale-title {
			font-size: 4.5rem;
			line-height: 1;
		}
	}

	.tale-description {
		opacity: 0.85;
		margin: 0 0 var(--content-space-lg) 0;
		max-width: var(--content-measure-subtitle);
		color: var(--text-color);
		font-style: italic;
		font-size: var(--content-font-size-body);
		line-height: 1.75rem;
		text-wrap: balance;
	}

	@media (min-width: 768px) {
		.tale-description {
			font-size: var(--content-font-size-body-lg);
			line-height: 2.25rem;
		}
	}

	.not-found {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--space-4);
		min-height: 100vh;
		color: var(--color-text);
	}
</style>
