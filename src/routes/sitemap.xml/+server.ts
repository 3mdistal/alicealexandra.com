import { loadPostsMeta } from '$lib/content/blog';
import { loadPoemsMeta } from '$lib/content/poems';
import { loadPostcardsMeta } from '$lib/content/postcards';
import { loadRawTallTaleMarkdownBySlug, loadTallTalesMeta } from '$lib/content/tall-tales.server';
import { serializeSitemap, STATIC_SITEMAP_PATHS, type SitemapEntry } from '$lib/server/sitemap';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const [posts, poems, postcards, tallTales] = await Promise.all([
		loadPostsMeta(),
		loadPoemsMeta(),
		loadPostcardsMeta(),
		loadTallTalesMeta()
	]);
	const tallTaleDocuments = await Promise.all(
		tallTales.map((tale) => loadRawTallTaleMarkdownBySlug(tale.slug))
	);

	const entries: SitemapEntry[] = [
		...STATIC_SITEMAP_PATHS.map((path) => ({ path })),
		...posts.map((post) => ({ path: `/blog/${post.slug}`, lastmod: post.publicationDate })),
		...poems.map((poem) => ({ path: `/studio/hfc/${poem.id}` })),
		...postcards.map((postcard) => ({
			path: `/studio/postcards/${postcard.slug}`,
			lastmod: postcard.lastEditedTime
		})),
		...tallTales.map((tale, index) => ({
			path: `/studio/tall-tales/${tale.slug}`,
			lastmod: tallTaleDocuments[index]?.frontmatter.lastEditedTime
		}))
	];

	return new Response(serializeSitemap(entries), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8'
		}
	});
};
