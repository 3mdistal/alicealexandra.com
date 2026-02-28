import { loadPostsMeta } from '$lib/content/blog';
import { loadPublications } from '$lib/content/career';
import { loadBuilderSnapshot } from '$lib/content/builder';

export const prerender = true;

export async function load() {
	const [blogPosts, publications, builderSnapshot] = await Promise.all([
		loadPostsMeta(),
		loadPublications(),
		loadBuilderSnapshot()
	]);

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

	// Publications from Vercel work
	const publicationEntries = publications.map((pub) => ({
		id: `career-pub-${pub.id}`,
		date: pub.date,
		area: 'career',
		category: pub.type,
		action: 'added',
		title: pub.name,
		href: pub.link,
		external: true
	}));

	// Builder.io blog posts
	const builderEntries = builderSnapshot.data
		.filter((post) => post.publishedAt)
		.map((post) => ({
			id: `career-builder-${post.id}`,
			date: post.publishedAt!.slice(0, 10),
			area: 'career',
			category: 'Builder.io Blog',
			action: 'added',
			title: post.title,
			href: post.url,
			external: true
		}));

	const careerEntries = [...publicationEntries, ...builderEntries].sort((a, b) =>
		b.date.localeCompare(a.date)
	);

	return {
		blogEntries,
		careerEntries
	};
}
