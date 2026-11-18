import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import {
	extractBlogMetadata,
	extractRssItems,
	extractSitemapIndexUrls,
	extractSitemapUrls,
	keepsPreviousSnapshot,
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

	it('lists the sitemaps in a sitemap index, as builder.io serves', () => {
		const index = [
			'<?xml version="1.0" encoding="UTF-8"?>',
			'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
			'<sitemap><loc>https://www.builder.io/sitemap.pages.xml</loc></sitemap>',
			'<sitemap><loc> https://www.builder.io/sitemap.blog.xml </loc></sitemap>',
			'</sitemapindex>'
		].join('');

		expect(extractSitemapIndexUrls(index)).toEqual([
			'https://www.builder.io/sitemap.pages.xml',
			'https://www.builder.io/sitemap.blog.xml'
		]);
		expect(extractSitemapUrls(index)).toEqual([]);
	});

	it('finds no sitemaps in a plain sitemap', async () => {
		const xmlPath = path.join(__dirname, '..', '__fixtures__', 'builder-sitemap.xml');

		expect(extractSitemapIndexUrls(await fs.readFile(xmlPath, 'utf8'))).toEqual([]);
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

	it('keeps the previous snapshot only when a scrape finds no posts', () => {
		const post = { id: 'a', title: 'A', description: 'A.', url: 'https://www.builder.io/blog/a' };

		expect(keepsPreviousSnapshot([post], [])).toBe(true);
		expect(keepsPreviousSnapshot([post, post], [post])).toBe(false);
		expect(keepsPreviousSnapshot([], [])).toBe(false);
		expect(keepsPreviousSnapshot(undefined, [])).toBe(false);
	});
});
