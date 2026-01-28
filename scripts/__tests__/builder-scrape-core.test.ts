// @ts-nocheck
import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import {
	extractBlogMetadata,
	extractRssItems,
	extractSitemapUrls,
	normalizeCanonicalUrl
} from '../scrape-builderio/core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

	describe('builder scrape core', () => {
		it('extracts blog URLs from sitemap', async () => {
			const xmlPath = path.join(__dirname, '..', '__fixtures__', 'builder-sitemap.xml');
			const xml = await fs.readFile(xmlPath, 'utf8');
			const urls = extractSitemapUrls(xml);

			expect(urls).toEqual([
				'https://www.builder.io/blog/with-trailing-space',
				'https://www.builder.io/blog/valid-slug'
			]);
		});

		it('extracts RSS items', async () => {
			const xmlPath = path.join(__dirname, '..', '__fixtures__', 'builder-rss.xml');
			const xml = await fs.readFile(xmlPath, 'utf8');
			const items = extractRssItems(xml);

			expect(items.map((item) => item.url)).toEqual([
				'https://www.builder.io/blog/first-post',
				'https://www.builder.io/blog/second-post'
			]);
		});

		it('parses blog metadata from HTML', async () => {
			const htmlPath = path.join(__dirname, '..', '__fixtures__', 'builder-post.html');
			const html = await fs.readFile(htmlPath, 'utf8');
			const meta = extractBlogMetadata(html);

			expect(meta).not.toBeNull();
			expect(meta?.authorName).toBe('Alice Moore');
			expect(meta?.title).toBe('Builder.io Example Post');
			expect(meta?.description).toBe('A short description for testing.');
			expect(meta?.publishedAt).toBe('2025-12-19T17:00:00.000Z');
		});

		it('normalizes canonical URLs', () => {
			expect(normalizeCanonicalUrl('https://www.builder.io/blog/valid-slug')).toBe(
				'https://www.builder.io/blog/valid-slug'
			);
			expect(normalizeCanonicalUrl('https://www.builder.io/blog')).toBeNull();
		});
	});
