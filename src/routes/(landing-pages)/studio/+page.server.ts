import { loadStudioCards } from '#lib/content/studio.ts';

export async function load() {
	const cards = await loadStudioCards();
	return { cards };
}

export const prerender = true;
