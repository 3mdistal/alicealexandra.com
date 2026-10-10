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

export const currentBlog: Writable<Array<BlockObjectResponse>> = writable();

export const analyticsCookie: Writable<boolean> = writable(false);
