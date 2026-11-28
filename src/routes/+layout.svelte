<script lang="ts">
	import '#lib/styles/fonts.ts';
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { getSurface, getTheme } from '#lib/theme/route-theme.ts';

	let { children }: { children: Snippet } = $props();

	const theme = $derived(getTheme(page.url.pathname));
	const surface = $derived(getSurface(page.url.pathname));

	$effect.pre(() => {
		document.documentElement.dataset['theme'] = theme;
		document.documentElement.dataset['surface'] = surface;
	});
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/images/logo/logo.png" />
</svelte:head>

<div
	class="app"
	data-theme={theme}
	data-surface={surface}
	data-sveltekit-preload-data="hover"
	data-sveltekit-preload-code="eager"
>
	<a class="skip-link" href="#content">Skip to content</a>
	<div id="content" tabindex="-1">
		{@render children()}
	</div>
</div>
