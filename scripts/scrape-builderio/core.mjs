import { parse as parseHtml } from 'node-html-parser';
import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '@_'
});

export function extractSitemapUrls(xml) {
	if (!xml) return [];
	let parsed;
	try {
		parsed = xmlParser.parse(xml);
	} catch {
		return [];
	}

	const urlset = parsed?.urlset?.url;
	const entries = normalizeArray(urlset);
	return entries
		.map((entry) => String(entry?.loc ?? '').trim())
		.filter((loc) => loc)
		.filter(isBuilderBlogUrl);
}

export function extractRssItems(xml) {
	if (!xml) return [];
	let parsed;
	try {
		parsed = xmlParser.parse(xml);
	} catch {
		return [];
	}

	const channel = parsed?.rss?.channel ?? parsed?.channel ?? parsed?.feed;
	const items = normalizeArray(channel?.item ?? channel?.entry);

	return items
		.map((item) => {
			const link = item?.link?.['@_href'] ?? item?.link ?? item?.guid ?? '';
			const url = String(link ?? '').trim();
			if (!url) return null;
			return {
				url,
				title: item?.title ? String(item.title) : undefined,
				description: item?.description
					? String(item.description)
					: item?.summary
						? String(item.summary)
						: undefined,
				publishedAt: item?.pubDate
					? String(item.pubDate)
					: item?.published
						? String(item.published)
						: undefined,
				authorName: item?.author
					? String(item.author)
					: item?.['dc:creator']
						? String(item['dc:creator'])
						: undefined
			};
		})
		.filter(Boolean)
		.filter((item) => isBuilderBlogUrl(item.url));
}

export function extractBlogMetadata(html) {
	if (!html) return null;

	const root = parseHtml(html);
	const metaDescription = pickMeta(root, 'name', 'description');
	const ogDescription = pickMeta(root, 'property', 'og:description');
	const ogTitle = pickMeta(root, 'property', 'og:title');
	const authorMeta = pickMeta(root, 'name', 'author');
	const publishedMeta = pickMeta(root, 'property', 'article:published_time');
	const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim();
	const pageTitle = root.querySelector('title')?.text?.trim();

	const jsonLdObjects = extractJsonLdObjects(root);
	const jsonLdMeta = pickJsonLdMetadata(jsonLdObjects);

	const title = jsonLdMeta?.title ?? ogTitle ?? pageTitle ?? '';
	const description = metaDescription ?? ogDescription ?? jsonLdMeta?.description ?? '';
	const authorName = jsonLdMeta?.authorName ?? authorMeta ?? '';
	const publishedAt = jsonLdMeta?.datePublished ?? publishedMeta;

	if (!title || !description || !authorName) {
		return null;
	}

	return {
		title: normalizeWhitespace(title),
		description: normalizeWhitespace(description),
		authorName: normalizeWhitespace(authorName),
		publishedAt: publishedAt ? normalizeWhitespace(publishedAt) : undefined,
		canonicalUrl: canonical ? normalizeWhitespace(canonical) : undefined
	};
}

export function normalizeCanonicalUrl(url) {
	if (!url) return null;
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
		if (parsed.hostname !== 'www.builder.io') return null;
		if (!parsed.pathname.startsWith('/blog/')) return null;
		return parsed.toString();
	} catch {
		return null;
	}
}

function extractJsonLdObjects(root) {
	const objects = [];
	const scripts = root.querySelectorAll('script[type="application/ld+json"]');
	for (const script of scripts) {
		const raw = script.text?.trim();
		if (!raw) continue;
		try {
			const parsed = JSON.parse(raw);
			pushJsonLdValue(objects, parsed);
		} catch {
			// ignore parse errors
		}
	}
	return objects;
}

function pushJsonLdValue(target, value) {
	if (!value) return;
	if (Array.isArray(value)) {
		for (const entry of value) {
			pushJsonLdValue(target, entry);
		}
		return;
	}
	if (typeof value === 'object') {
		target.push(value);
	}
}

function pickJsonLdMetadata(jsonLdObjects) {
	const candidates = flattenJsonLdObjects(jsonLdObjects);
	for (const candidate of candidates) {
		const types = normalizeTypes(candidate?.['@type']);
		const isBlogEntry = types.some((type) =>
			['blogposting', 'article', 'blog'].includes(type.toLowerCase())
		);
		if (!isBlogEntry) continue;

		const title = candidate?.headline ?? candidate?.name;
		const description = candidate?.description;
		const datePublished = candidate?.datePublished;
		const authorName = normalizeAuthorName(candidate?.author);

		if (!title || !description || !authorName) {
			continue;
		}

		return {
			title: String(title),
			description: String(description),
			authorName,
			datePublished: datePublished ? String(datePublished) : undefined
		};
	}

	return null;
}

function flattenJsonLdObjects(jsonLdObjects) {
	const items = [];
	for (const entry of jsonLdObjects ?? []) {
		if (!entry || typeof entry !== 'object') continue;
		items.push(entry);
		const graph = entry['@graph'];
		if (Array.isArray(graph)) {
			for (const node of graph) {
				if (node && typeof node === 'object') {
					items.push(node);
				}
			}
		}
	}
	return items;
}

function normalizeTypes(types) {
	if (!types) return [];
	if (Array.isArray(types)) return types.map((type) => String(type));
	return [String(types)];
}

function normalizeAuthorName(author) {
	if (!author) return '';
	if (typeof author === 'string') return author;
	if (Array.isArray(author)) {
		const names = author.map((entry) => normalizeAuthorName(entry)).filter(Boolean);
		return names.join(', ');
	}
	if (typeof author === 'object') {
		const name = author.name ?? author?.['@name'];
		return name ? String(name) : '';
	}
	return '';
}

function pickMeta(root, attr, value) {
	const selector = `meta[${attr}="${value}"]`;
	const content = root.querySelector(selector)?.getAttribute('content');
	return content?.trim() || undefined;
}

function normalizeWhitespace(value) {
	return value.replace(/\s+/g, ' ').trim();
}

function normalizeArray(value) {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}

function isBuilderBlogUrl(value) {
	try {
		const url = new URL(value);
		if (url.hostname !== 'www.builder.io') return false;
		if (!url.pathname.startsWith('/blog')) return false;
		if (url.pathname === '/blog' || url.pathname === '/blog/') return false;
		if (url.pathname.startsWith('/blog/page/')) return false;
		return true;
	} catch {
		return false;
	}
}
