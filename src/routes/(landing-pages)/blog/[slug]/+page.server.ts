import { loadPostsMeta, loadPostBySlug, transformPostToNotionFormat } from '$lib/content/blog';
import { error, redirect } from '@sveltejs/kit';

// Permanent redirects for old slugs
const SLUG_REDIRECTS: Record<string, string> = {
	'thinking-in-quantum': 'the-shady-side-of-the-hill'
};

// Prerender all blog posts at build time
export const prerender = true;

// Generate all blog post routes at build time
export async function entries() {
	const posts = await loadPostsMeta();
	return posts.map((post) => ({ slug: post.slug }));
}

export async function load({ params }: { params: { slug: string } }) {
	// Handle permanent redirects for old slugs
	const redirectTo = SLUG_REDIRECTS[params.slug];
	if (redirectTo) {
		redirect(301, `/blog/${redirectTo}`);
	}

	const post = await loadPostBySlug(params.slug);

	if (!post) {
		throw error(404, 'Blog post not found');
	}

	return {
		post: transformPostToNotionFormat(post)
	};
}
