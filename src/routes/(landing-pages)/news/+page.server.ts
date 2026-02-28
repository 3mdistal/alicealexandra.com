import { loadPostsMeta } from '$lib/content/blog';

export const prerender = true;

export async function load() {
	const blogPosts = await loadPostsMeta();

	// Convert to NewsEntry format
	const blogEntries = blogPosts
		.map((post) => ({
			id: `blog-${post.slug}`,
			date: post.publicationDate, // Should be in YYYY-MM-DD
			area: 'blog',
			category: post.category || 'post',
			action: 'added',
			title: post.title,
			href: `/blog/${post.slug}`
		}))
		.sort((a, b) => b.date.localeCompare(a.date));

	return {
		blogEntries
	};
}
