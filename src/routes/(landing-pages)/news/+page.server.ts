import { loadPostsMeta } from '$lib/content/blog';
import { loadPublications } from '$lib/content/career';

export const prerender = true;

export async function load() {
	const [blogPosts, publications] = await Promise.all([loadPostsMeta(), loadPublications()]);

	const blogEntries = blogPosts
		.map((post) => ({
			id: `blog-${post.slug}`,
			date: post.publicationDate,
			area: 'blog',
			category: 'Blog Post',
			action: 'added',
			title: post.title,
			href: `/blog/${post.slug}`
		}))
		.sort((a, b) => b.date.localeCompare(a.date));

	// Publications from Vercel work (static, from content repo)
	const staticCareerEntries = publications.map((pub) => ({
		id: `career-pub-${pub.id}`,
		date: pub.date,
		area: 'career',
		category: pub.type,
		action: 'added',
		title: pub.name,
		href: pub.link,
		external: true
	}));

	return {
		blogEntries,
		staticCareerEntries
	};
}
