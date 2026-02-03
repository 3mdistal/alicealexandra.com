<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';

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

	let theme: 'home' | 'about' | 'studio' | 'career' | 'blog' | 'news' = 'home';

	$: theme = themeFromPathname(page.url.pathname);

	$: if (typeof document !== 'undefined') {
		document.body.dataset['theme'] = theme;
	}
</script>

<svelte:head>
	<meta charset="utf-8" />
	<link rel="icon" type="image" href="/images/logo/logo.png" />
	<meta name="viewport" content="width=device-width" />
</svelte:head>

<div data-sveltekit-preload-data="hover" data-sveltekit-preload-code="eager">
	<slot />
</div>
