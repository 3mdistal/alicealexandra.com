import { loadPublications, type Publication } from '$lib/content/career';

export async function load() {
	const publications = await loadPublications();
	return { publications };
}

export const prerender = true;

// Re-export type for component use
export type { Publication };
