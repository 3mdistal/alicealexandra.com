<script lang="ts">
	import HomepageWrapper from '../lib/homepage/homepage-wrapper.svelte';
	import SiteTitle from '../lib/homepage/site-title.svelte';
	import Svgs from '$lib/icons/svgs.svelte';
	import { pageState } from '../lib/stores';
	import { onMount } from 'svelte';
	import { IMAGE_DOMAIN } from '$lib/utils/images';

	onMount(() => {
		pageState.set('home');
	});
</script>

<svelte:head>
	<title>Tempo Immaterial</title>
	<meta
		name="description"
		content="The studio of Alice Alexandra Moore. Creative work, ramblings, career and more."
	/>

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content="https://www.alicealexandra.com" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Tempo Immaterial" />
	<meta
		property="og:description"
		content="The studio of Alice Alexandra Moore. Creative work, ramblings, career and more."
	/>
	<meta
		property="og:image"
		content="https://{IMAGE_DOMAIN}/ogimage.webp"
	/>

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@tempoimmaterial" />
	<meta name="twitter:creator" content="@tempoimmaterial" />
	<meta name="twitter:domain" content="alicealexandra.com" />
	<meta name="twitter:url" content="https://www.alicealexandra.com" />
	<meta name="twitter:title" content="Tempo Immaterial" />
	<meta
		name="twitter:description"
		content="The studio of Alice Alexandra Moore. Creative work, ramblings, collabs, and more."
	/>
	<meta
		name="twitter:image"
		content="https://{IMAGE_DOMAIN}/ogimage.webp"
	/>
	<meta name="twitter:image:alt" content="The homepage of alicealexandra.com." />
</svelte:head>

<div class="main-container homepage">
	<!-- SVG clipPath defs must exist before homepage sections render to avoid a flash of unclipped blocks -->
	<Svgs />
	<SiteTitle />
	<HomepageWrapper />
	<div class="mastodon-link">
		<a rel="me" href="https://hachyderm.io/@tempoimmaterial">Mastodon</a>
	</div>
</div>

<style>
	.homepage {
		background-color: var(--color-bg);
	}

	.main-container {
		--top-padding: 10vh;
		display: flex;
		position: relative;
		flex-direction: column;
		box-sizing: content-box;
		padding-top: var(--top-padding);
		height: calc(100dvh - var(--top-padding));
		overflow: hidden;
	}

	.mastodon-link {
		display: none;
	}

	@media (min-width: 768px) {
		.main-container {
			--top-padding: 6vh;
		}
	}
</style>
