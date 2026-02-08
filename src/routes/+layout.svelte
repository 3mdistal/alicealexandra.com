<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	function themeFromPathname(
		pathname: string
	): 'home' | 'about' | 'studio' | 'career' | 'blog' | 'news' {
		if (pathname === '/' || pathname === '') return 'home';
		if (pathname.startsWith('/about')) return 'about';
		if (pathname.startsWith('/studio')) return 'studio';
		if (pathname.startsWith('/career')) return 'career';
		if (pathname.startsWith('/blog')) return 'blog';
		if (pathname.startsWith('/news')) return 'news';
		return 'home';
	}

	function surfaceFromPathname(pathname: string): 'default' | 'content' {
		if (pathname.startsWith('/blog')) return 'content';
		if (pathname.startsWith('/studio/postcards')) return 'content';
		if (pathname.startsWith('/studio/illustrations')) return 'content';
		return 'default';
	}

	let theme: 'home' | 'about' | 'studio' | 'career' | 'blog' | 'news' = 'home';
	let surface: 'default' | 'content' = 'default';

	$: theme = themeFromPathname($page.url.pathname);
	$: surface = surfaceFromPathname($page.url.pathname);

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
	<slot />
</div>
