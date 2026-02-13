import { describe, expect, it } from 'vitest';
import { isActive, navItems } from './nav-model';

describe('navItems', () => {
	it('keeps expected ordering and destinations', () => {
		expect(navItems.map((item) => item.href)).toEqual([
			'/',
			'/about',
			'/studio',
			'/career',
			'/blog',
			'/news'
		]);
	});
});

describe('isActive', () => {
	it('marks exact matches as active', () => {
		expect(isActive('/about', '/about')).toBe(true);
		expect(isActive('/news', '/news')).toBe(true);
	});

	it('marks descendants as active', () => {
		expect(isActive('/blog/some-post', '/blog')).toBe(true);
		expect(isActive('/studio/postcards/afterlife', '/studio')).toBe(true);
	});

	it('does not mark non-matching routes as active', () => {
		expect(isActive('/about', '/blog')).toBe(false);
		expect(isActive('/studio', '/news')).toBe(false);
	});

	it('treats home as active only on root', () => {
		expect(isActive('/', '/')).toBe(true);
		expect(isActive('/about', '/')).toBe(false);
	});
});
