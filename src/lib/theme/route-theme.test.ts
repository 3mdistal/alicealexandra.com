import { describe, expect, it } from 'vitest';
import { getSurface, getTheme } from './route-theme';

describe('getTheme', () => {
	it('maps known top-level paths to themes', () => {
		expect(getTheme('/')).toBe('home');
		expect(getTheme('/about')).toBe('about');
		expect(getTheme('/studio/arcade')).toBe('studio');
		expect(getTheme('/career/vercel')).toBe('career');
		expect(getTheme('/blog/my-post')).toBe('blog');
		expect(getTheme('/news')).toBe('news');
	});

	it('falls back to home for unknown paths', () => {
		const pathname = '/unknown';

		expect(
			getTheme(pathname),
			`route-theme: unknown pathname "${pathname}" fell back to "home"`
		).toBe('home');
	});
});

describe('getSurface', () => {
	it('maps content routes to content surface', () => {
		expect(getSurface('/studio/postcards/test')).toBe('content');
		expect(getSurface('/studio/illustrations')).toBe('content');
	});

	it('uses default surface for other routes', () => {
		expect(getSurface('/studio')).toBe('default');
		expect(getSurface('/about')).toBe('default');
	});
});
