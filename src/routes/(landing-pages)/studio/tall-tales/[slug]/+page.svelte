<script lang="ts">
	import '$lib/styles/prose.css';
	import { marked } from 'marked';
	import AudioPlayer from '$lib/components/audio-player.svelte';

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
		{#each sectionsHTML as section}
			<section
				class="tall-tale-section parallax"
				style="--bg-image: url('{section.theme.backgroundImage}'); --text-color: {section.theme
					.textColor};"
			>
				<div class="section-content prose">
					{@html section.htmlContent}
				</div>
			</section>
		{/each}
	{:else}
		<div class="not-found">
			<h1>Story not found</h1>
			<a href="/studio/tall-tales">← Back to Stories</a>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	.tall-tale-wrapper {
		/* Reset margin from main layouts if necessary */
		position: relative;
		right: 50%;
		left: 50%;
		margin-right: -50vw;
		margin-left: -50vw;
		background: #000;
		width: 100vw;
	}

	.tall-tale-section {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		padding: 6rem 2rem;
		min-height: 100vh;
		overflow: hidden;
		color: var(--text-color, #fff);
	}

	.tall-tale-section::before {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		opacity: 0.4;
		z-index: -2;
		background-image: var(--bg-image);
		background-position: center;
		background-size: cover;
		content: '';
	}

	.tall-tale-section::after {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: -1;
		mix-blend-mode: multiply;
		background-color: rgba(0, 0, 0, 0.6);
		content: '';
	}

	.tall-tale-section.parallax::before {
		background-attachment: fixed;
	}

	.section-content {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 700px;
		font-size: 1.25rem;
		line-height: 1.8;
		font-family: 'Spectral', serif;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	}

	.section-content :global(p) {
		margin-bottom: 1.5rem;
	}

	.not-found {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		color: white;
	}

	.not-found a {
		margin-top: 1rem;
		color: white;
		text-decoration: underline;
	}
</style>
