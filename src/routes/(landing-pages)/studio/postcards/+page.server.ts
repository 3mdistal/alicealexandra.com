import { loadPostcardsMeta } from '$lib/content/postcards';

// Prerender this page at build time - no runtime API calls needed
export const prerender = true;

export async function load() {
	// Re-throw during build so we see the actual error if content is missing/malformed
	const postcards = await loadPostcardsMeta();
	return { postcards };
}
