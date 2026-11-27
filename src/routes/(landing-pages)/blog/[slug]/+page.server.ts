import { loadPostsMeta, loadPostBySlug } from '#lib/content/blog.ts';
import { measurePostImages } from '#lib/server/blog-image-sizes.ts';
import { error } from '@sveltejs/kit';

// Prerender all blog posts at build time
export const prerender = true;

// Generate all blog post routes at build time
export async function entries() {
	const posts = await loadPostsMeta();
	return posts.map((post) => ({ slug: post.slug }));
}

export async function load({
	params,
	fetch
}: {
	params: { slug: string };
	fetch: typeof globalThis.fetch;
}) {
	const post = await loadPostBySlug(params.slug);

	if (!post) {
		throw error(404, 'Blog post not found');
	}

	return { post, imageSizes: await measurePostImages(post.content, fetch) };
}
