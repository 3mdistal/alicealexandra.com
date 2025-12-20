import type { BlockObjectResponse } from '$lib/notion/types/notion-types';
import { readable, writable, type Writable, type Readable } from 'svelte/store';

export const pageState = writable('home');

export const names: Readable<Array<'about' | 'studio' | 'career' | 'blog' | 'news'>> = readable([
	'about',
	'studio',
	'career',
	'blog',
	'news'
]);

export const accentColors: Readable<
	Record<'about' | 'studio' | 'career' | 'blog' | 'news', string>
> = readable({
	about: '#271647',
	studio: '#243269',
	career: '#642e1a',
	blog: '#d1dce7',
	news: '#726a12'
});

export const backgroundColors: Readable<
	Record<'home' | 'about' | 'studio' | 'career' | 'blog' | 'news', string>
> = readable({
	home: '#fafafa',
	about: '#beb5ca',
	studio: '#d6ddf0',
	career: '#dcc9c6',
	blog: '#838391',
	news: '#eeeded'
});

export const currentBlog: Writable<Array<BlockObjectResponse>> = writable();

export const analyticsCookie: Writable<boolean> = writable(false);
