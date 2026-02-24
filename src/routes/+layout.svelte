<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { getSurface, getTheme, type SiteSurface, type SiteTheme } from '$lib/theme/route-theme';

	let theme: SiteTheme = 'home';
	let surface: SiteSurface = 'default';

	$: theme = getTheme($page.url.pathname);
	$: surface = getSurface($page.url.pathname);

	$: {
		if (typeof document !== 'undefined') {
			document.documentElement.dataset['theme'] = theme;
			document.documentElement.dataset['surface'] = surface;
		}
	}
</script>

<svelte:head>
	<meta charset="utf-8" />
	<link rel="icon" type="image" href="/images/logo/logo.png" />
	<meta name="viewport" content="width=device-width" />
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
		<slot />
	</div>
</div>
