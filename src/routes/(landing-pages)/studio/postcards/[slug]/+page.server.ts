import { loadPostcardBySlug, loadPostcardsMeta } from '$lib/content/postcards';
import { error } from '@sveltejs/kit';

// Prerender all postcards at build time
export const prerender = true;

// Generate all postcard routes at build time
export async function entries() {
	const postcards = await loadPostcardsMeta();
	return postcards.map((p) => ({ slug: p.slug }));
}

export async function load({ params }: { params: { slug: string } }) {
	const postcard = await loadPostcardBySlug(params.slug);
	if (!postcard) {
		throw error(404, 'Postcard not found');
	}

	return { postcard };
}
