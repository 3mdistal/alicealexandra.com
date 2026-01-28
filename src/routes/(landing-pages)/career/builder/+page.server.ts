import { loadBuilderPosts, type BuilderPost } from '$lib/content/builder';

export function load() {
	const posts = loadBuilderPosts();
	return { posts };
}

export const prerender = true;

export type { BuilderPost };
