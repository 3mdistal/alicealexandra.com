import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import {
	extractBlogUrlsFromSitemap,
	extractJsonLdObjects,
	normalizeBuilderPost,
	pickBlogMetadata
} from '../builder-scrape-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('builder scrape core', () => {
	it('extracts blog URLs from sitemap', async () => {
		const xmlPath = path.join(__dirname, '..', '__fixtures__', 'builder-sitemap.xml');
		const xml = await fs.readFile(xmlPath, 'utf8');
		const urls = extractBlogUrlsFromSitemap(xml);

		expect(urls).toEqual([
			'https://www.builder.io/blog/with-trailing-space',
			'https://www.builder.io/blog/valid-slug'
		]);
	});

	it('parses JSON-LD blog metadata', async () => {
		const htmlPath = path.join(__dirname, '..', '__fixtures__', 'builder-post.html');
		const html = await fs.readFile(htmlPath, 'utf8');
		const jsonLd = extractJsonLdObjects(html);
		const meta = pickBlogMetadata(jsonLd);

		expect(meta).not.toBeNull();
		expect(meta?.authorName).toBe('Alice Moore');
		expect(meta?.title).toBe('Builder.io Example Post');
		expect(meta?.description).toBe('A short description for testing.');

		const normalized = normalizeBuilderPost('https://www.builder.io/blog/valid-slug', meta);
		expect(normalized).not.toBeNull();
		expect(normalized?.id).toBe('valid-slug');
		expect(normalized?.datePublished).toBe('2025-12-19T17:00:00.000Z');
	});
});
