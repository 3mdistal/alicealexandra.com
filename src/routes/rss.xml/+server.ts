import { renderBlogMarkdown } from '$lib/blog/render-markdown';
import { loadPostBySlug, loadPostsMeta, type BlogPost } from '$lib/content/blog';
import { CANONICAL_ORIGIN } from '$lib/server/agent-readiness';
import { serializeRssFeed, type RssFeedItemInput } from '$lib/server/rss';
import type { RequestHandler } from './$types';

export const prerender = true;

// Kept in sync with the meta description on the blog index page
// (src/routes/(landing-pages)/blog/+page.svelte).
const BLOG_DESCRIPTION =
	"Blog entries and writing that doesn't quite fit anywhere else, from Alice Alexandra Moore.";

function toRssItem(post: BlogPost): RssFeedItemInput {
	return {
		slug: post.slug,
		title: post.title,
		description: post.summary || post.ogDescription || post.subtitle,
		contentHtml: renderBlogMarkdown(post.content),
		publicationDate: post.publicationDate,
		category: post.category
	};
}

export const GET: RequestHandler = async () => {
	const postsMeta = await loadPostsMeta();
	const posts = await Promise.all(postsMeta.map((meta) => loadPostBySlug(meta.slug)));

	const items = posts
		.filter((post): post is BlogPost => post !== null)
		.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime())
		.map(toRssItem);

	const xml = serializeRssFeed({
		title: 'Alice Alexandra Moore',
		link: `${CANONICAL_ORIGIN}/blog`,
		description: BLOG_DESCRIPTION,
		feedUrl: `${CANONICAL_ORIGIN}/rss.xml`,
		language: 'en',
		items
	});

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8'
		}
	});
};
