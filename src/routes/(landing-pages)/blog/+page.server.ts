import { loadPostsMeta, transformPostsToNotionFormat } from '$lib/content/blog';

// Prerender this page at build time - no runtime API calls needed
export const prerender = true;

export async function load() {
	try {
		const posts = await loadPostsMeta();
		return {
			post: transformPostsToNotionFormat(posts)
		};
	} catch (error) {
		console.error('Failed to load blog posts:', error);
		// Re-throw during build so we see the actual error
		throw error;
	}
}
