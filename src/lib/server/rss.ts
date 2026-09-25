import { CANONICAL_ORIGIN } from './agent-readiness';

export interface RssFeedItemInput {
	slug: string;
	title: string;
	description: string;
	contentHtml: string;
	/** ISO calendar date, e.g. "2026-09-10". Treated as UTC midnight. */
	publicationDate: string;
	category?: string;
}

export interface RssFeedInput {
	title: string;
	link: string;
	description: string;
	feedUrl: string;
	language?: string;
	items: RssFeedItemInput[];
}

/**
 * Escapes text for safe inclusion in XML element/attribute content.
 */
export function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Replaces the site's custom `{super:x}` / `{sub:x}` markers with real
 * `<sup>`/`<sub>` tags. This is the feed-safe (pure string) equivalent of
 * `subAndSuper` in `$lib/notion/utils/blog-helpers.ts`, which mutates the
 * DOM in the browser. Feed readers never run that browser code, so raw
 * markers would otherwise leak into `content:encoded`.
 */
export function applySubAndSuperMarkers(html: string): string {
	return html
		.replace(/\{super:([^}]*)\}/g, '<sup>$1</sup>')
		.replace(/\{sub:([^}]*)\}/g, '<sub>$1</sub>');
}

/**
 * Rewrites root-relative `src="/..."` and `href="/..."` attributes to
 * absolute URLs against `origin`. Protocol-relative (`//...`) and already
 * absolute URLs are left untouched.
 */
export function absolutizeHtmlUrls(html: string, origin: string = CANONICAL_ORIGIN): string {
	return html.replace(/((?:src|href)=")\/(?!\/)/g, `$1${origin}/`);
}

/**
 * Makes arbitrary text safe to place inside a CDATA section by splitting
 * any embedded `]]>` sequence so it can't terminate the section early.
 */
export function makeCdataSafe(content: string): string {
	return content.split(']]>').join(']]]]><![CDATA[>');
}

/**
 * Wraps content in a CDATA section, guarding against embedded `]]>`.
 */
export function wrapCdata(content: string): string {
	return `<![CDATA[${makeCdataSafe(content)}]]>`;
}

/**
 * Formats an ISO calendar date (`YYYY-MM-DD`) as an RFC-822 date at UTC
 * midnight, suitable for RSS `pubDate`/`lastBuildDate` elements.
 */
export function toRfc822(dateOnly: string): string {
	return new Date(`${dateOnly}T00:00:00.000Z`).toUTCString();
}

function buildItemXml(item: RssFeedItemInput, origin: string): string {
	const link = `${origin}/blog/${item.slug}`;
	const processedHtml = absolutizeHtmlUrls(applySubAndSuperMarkers(item.contentHtml), origin);
	const categoryXml = item.category
		? `      <category>${escapeXml(item.category)}</category>`
		: null;

	return [
		'    <item>',
		`      <title>${escapeXml(item.title)}</title>`,
		`      <link>${escapeXml(link)}</link>`,
		`      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
		`      <pubDate>${toRfc822(item.publicationDate)}</pubDate>`,
		categoryXml,
		`      <description>${escapeXml(item.description)}</description>`,
		`      <content:encoded>${wrapCdata(processedHtml)}</content:encoded>`,
		'    </item>'
	]
		.filter((line): line is string => line !== null)
		.join('\n');
}

/**
 * Serializes an RSS 2.0 feed (with the `content` and `atom` namespaces)
 * from plain data. Pure and testable: no filesystem or network access.
 */
export function serializeRssFeed(feed: RssFeedInput, origin: string = CANONICAL_ORIGIN): string {
	const language = feed.language ?? 'en';
	const newestPublicationDate = feed.items[0]?.publicationDate;
	const lastBuildDate = newestPublicationDate
		? toRfc822(newestPublicationDate)
		: new Date(0).toUTCString();

	const itemsXml = feed.items.map((item) => buildItemXml(item, origin)).join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feed.title)}</title>
    <link>${escapeXml(feed.link)}</link>
    <description>${escapeXml(feed.description)}</description>
    <language>${escapeXml(language)}</language>
    <atom:link href="${escapeXml(feed.feedUrl)}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${itemsXml}
  </channel>
</rss>
`;
}
