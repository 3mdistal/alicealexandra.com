import { loadPostsMeta, loadPostBySlug, transformPostToNotionFormat } from '$lib/content/blog';
import { error } from '@sveltejs/kit';

// Prerender all blog posts at build time
export const prerender = true;

// Generate all blog post routes at build time
export async function entries() {
	const posts = await loadPostsMeta();
	return posts.map((post) => ({ slug: post.slug }));
}

export async function load({ params }: { params: { slug: string } }) {
	const post = await loadPostBySlug(params.slug);

	if (!post) {
		throw error(404, 'Blog post not found');
	}

	return {
		post: transformPostToNotionFormat(post)
	};
}
