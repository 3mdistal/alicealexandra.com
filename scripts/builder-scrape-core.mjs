// @ts-nocheck
/// <reference lib="es2015" />

/**
 * @param {string} xml
 * @returns {string[]}
 */
export function extractBlogUrlsFromSitemap(xml) {
	/** @type {string[]} */
	const urls = [];
	if (!xml) {
		return urls;
	}

	const locRegex = /<loc>([^<]+)<\/loc>/gi;
	let match = locRegex.exec(xml);
	while (match) {
		const raw = match[1]?.trim();
		if (raw) {
			try {
				const url = new URL(raw);
				if (url.hostname === 'www.builder.io' && url.pathname.startsWith('/blog')) {
					const path = url.pathname;
					const isRoot = path === '/blog' || path === '/blog/';
					const isPaged = path.startsWith('/blog/page/');
					const isPost = path.startsWith('/blog/') && !isRoot && !isPaged;
					if (isPost) {
						urls.push(url.toString());
					}
				}
			} catch {
				// Ignore malformed URLs
			}
		}
		match = locRegex.exec(xml);
	}

	return [...new Set(urls)];
}

/**
 * @param {string} html
 * @returns {unknown[]}
 */
export function extractJsonLdObjects(html) {
	/** @type {unknown[]} */
	const objects = [];
	if (!html) {
		return objects;
	}

	const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
	let match = scriptRegex.exec(html);
	while (match) {
		const raw = match[1]?.trim();
		if (raw) {
			try {
				const parsed = JSON.parse(raw);
				pushJsonLdValue(objects, parsed);
			} catch {
				// Ignore parse errors
			}
		}
		match = scriptRegex.exec(html);
	}

	return objects;
}

/**
 * @param {unknown[]} target
 * @param {unknown} value
 */
function pushJsonLdValue(target, value) {
	if (!value) {
		return;
	}
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

/**
 * @param {unknown[]} jsonLdObjects
 * @returns {{ title: string; description: string; datePublished: string; authorName: string } | null}
 */
export function pickBlogMetadata(jsonLdObjects) {
	const candidates = flattenJsonLdObjects(jsonLdObjects);
	for (const candidate of candidates) {
		const types = normalizeTypes(candidate?.['@type']);
		const isBlogEntry = types.some((type) =>
			['blogposting', 'article', 'blog'].includes(type.toLowerCase())
		);
		if (!isBlogEntry) {
			continue;
		}

		const title = candidate?.headline ?? candidate?.name;
		const description = candidate?.description;
		const datePublished = candidate?.datePublished;
		const authorName = normalizeAuthorName(candidate?.author);

		if (!title || !datePublished) {
			continue;
		}

		return {
			title: String(title),
			description: description ? normalizeWhitespace(String(description)) : '',
			datePublished: String(datePublished),
			authorName
		};
	}

	return null;
}

/**
 * @param {string} url
 * @param {{ title: string; description?: string; datePublished: string } | null} meta
 * @returns {{ id: string; title: string; description: string; url: string; datePublished: string } | null}
 */
export function normalizeBuilderPost(url, meta) {
	if (!meta?.title || !meta?.datePublished) {
		return null;
	}

	let parsedUrl;
	try {
		parsedUrl = new URL(url);
	} catch {
		return null;
	}

	const slug = parsedUrl.pathname.split('/').filter(Boolean).pop();
	if (!slug) {
		return null;
	}

	const date = new Date(meta.datePublished);
	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return {
		id: slug,
		title: meta.title,
		description: meta.description ?? '',
		url: parsedUrl.toString(),
		datePublished: date.toISOString()
	};
}

/**
 * @param {unknown[]} jsonLdObjects
 * @returns {Record<string, unknown>[]}
 */
function flattenJsonLdObjects(jsonLdObjects) {
	/** @type {Record<string, unknown>[]} */
	const items = [];
	for (const entry of jsonLdObjects ?? []) {
		if (!entry || typeof entry !== 'object') {
			continue;
		}

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

/**
 * @param {unknown} types
 * @returns {string[]}
 */
function normalizeTypes(types) {
	if (!types) {
		return [];
	}
	if (Array.isArray(types)) {
		return types.map((type) => String(type));
	}
	return [String(types)];
}

/**
 * @param {unknown} author
 * @returns {string}
 */
function normalizeAuthorName(author) {
	if (!author) {
		return '';
	}
	if (typeof author === 'string') {
		return author;
	}
	if (Array.isArray(author)) {
		const names = author
			.map((entry) => normalizeAuthorName(entry))
			.filter((entry) => entry);
		return names.join(', ');
	}
	if (typeof author === 'object') {
		const name = author.name ?? author?.['@name'];
		return name ? String(name) : '';
	}
	return '';
}

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeWhitespace(value) {
	return value.replace(/\s+/g, ' ').trim();
}
