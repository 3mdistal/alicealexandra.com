import { loadTallTaleBySlug, loadTallTalesMeta } from '$lib/content/tall-tales';
import { error } from '@sveltejs/kit';

// Prerender all tall tales at build time
export const prerender = true;

// Generate all tall tale routes at build time
export async function entries() {
	try {
		const tales = await loadTallTalesMeta();
		return tales.map((t) => ({ slug: t.slug }));
	} catch (e) {
		console.warn('Could not load tall tales for prerendering', e);
		return [];
	}
}

export async function load({ params }: { params: { slug: string } }) {
	const tale = await loadTallTaleBySlug(params.slug);
	if (!tale) {
		throw error(404, 'Tall tale not found');
	}

	return { tale };
}
