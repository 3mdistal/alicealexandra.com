export type SiteTheme = 'home' | 'about' | 'studio' | 'career' | 'blog' | 'news';
export type SiteSurface = 'default' | 'content';

export function getTheme(pathname: string): SiteTheme {
	if (pathname === '/' || pathname === '') return 'home';
	if (pathname.startsWith('/about')) return 'about';
	if (pathname.startsWith('/studio')) return 'studio';
	if (pathname.startsWith('/career')) return 'career';
	if (pathname.startsWith('/blog')) return 'blog';
	if (pathname.startsWith('/news')) return 'news';

	return 'home';
}

export function getSurface(pathname: string): SiteSurface {
	if (pathname.startsWith('/studio/postcards')) return 'content';
	if (pathname.startsWith('/studio/illustrations')) return 'content';

	return 'default';
}
