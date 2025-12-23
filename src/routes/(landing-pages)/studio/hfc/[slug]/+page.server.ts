import { loadPoemBySlug, loadPoemsMeta } from '$lib/content/poems';
import { error } from '@sveltejs/kit';

// Prerender all poems at build time
export const prerender = true;

// Generate all poem routes at build time
export async function entries() {
	const poems = await loadPoemsMeta();
	return poems.map((p) => ({ slug: p.id }));
}

export async function load({ params }: { params: { slug: string } }) {
	const poem = await loadPoemBySlug(params.slug);
	if (!poem) {
		throw error(404, 'Poem not found');
	}

	return { poem };
}
