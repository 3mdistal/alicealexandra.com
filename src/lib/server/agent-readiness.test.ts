import { XMLParser } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';
import { HOMEPAGE_MARKDOWN, LLMS_TEXT } from './agent-readiness';
import { serializeSitemap } from './sitemap';

describe('agent-facing resources', () => {
	it('keeps homepage Markdown specific and honest', () => {
		expect(HOMEPAGE_MARKDOWN).toContain('# Tempo Immaterial');
		expect(HOMEPAGE_MARKDOWN).toContain('## When to use this site');
		expect(HOMEPAGE_MARKDOWN).toContain('https://www.alicealexandra.com/about');
		expect(HOMEPAGE_MARKDOWN).toContain('not an agent API or transactional service');
	});

	it('gives agents use guidance and canonical links', () => {
		expect(LLMS_TEXT).toContain('## When to use this site');
		expect(LLMS_TEXT).toContain('https://www.alicealexandra.com/sitemap.xml');
		expect(LLMS_TEXT).toContain('Do not treat this site as an API');
	});

	it('serializes unique canonical sitemap entries with evidence-based dates', () => {
		const xml = serializeSitemap([
			{ path: '/about' },
			{ path: '/blog/example', lastmod: '2026-08-20' },
			{ path: '/about', lastmod: 'not-a-date' },
			{ path: 'not-absolute' }
		]);
		const parsed = new XMLParser().parse(xml);
		const urls = parsed.urlset.url as Array<{ loc: string; lastmod?: string }>;

		expect(urls).toHaveLength(2);
		expect(urls).toContainEqual({ loc: 'https://www.alicealexandra.com/about' });
		expect(urls).toContainEqual({
			loc: 'https://www.alicealexandra.com/blog/example',
			lastmod: '2026-08-20T00:00:00.000Z'
		});
	});
});
