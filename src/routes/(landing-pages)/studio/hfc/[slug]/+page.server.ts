import { loadPoemBySlug, loadPoemsMeta, loadSections } from '$lib/content/poems';
import { error } from '@sveltejs/kit';

// Prerender all poems at build time
export const prerender = true;

// Generate all poem routes at build time
export async function entries() {
	const poems = await loadPoemsMeta();
	return poems.map((p) => ({ slug: p.id }));
}

export async function load({ params }: { params: { slug: string } }) {
	const [poem, sections] = await Promise.all([loadPoemBySlug(params.slug), loadSections()]);

	if (!poem) {
		throw error(404, 'Poem not found');
	}

	// Find the section that matches this poem's sectionName
	const section = sections.find((s) => s.name === poem.sectionName);
	const backgroundImage = section?.secondaryImage || null;

	return { poem, backgroundImage };
}
