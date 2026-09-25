import { XMLParser } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';
import {
	absolutizeHtmlUrls,
	applySubAndSuperMarkers,
	escapeXml,
	makeCdataSafe,
	serializeRssFeed,
	toRfc822,
	wrapCdata
} from './rss';

// fast-xml-parser represents adjacent CDATA sections (which our escaping
// technique produces when content contains "]]>") as an array of chunks
// rather than a single concatenated string.
function readCdata(value: unknown): string {
	if (Array.isArray(value)) return value.join('');
	if (typeof value === 'object' && value !== null && '__cdata' in value) {
		return readCdata((value as { __cdata: unknown }).__cdata);
	}
	return String(value);
}

describe('escapeXml', () => {
	it('escapes the five XML special characters', () => {
		expect(escapeXml(`Tom & Jerry's "Big" <Adventure>`)).toBe(
			'Tom &amp; Jerry&apos;s &quot;Big&quot; &lt;Adventure&gt;'
		);
	});

	it('leaves ordinary text untouched', () => {
		expect(escapeXml('a plain title')).toBe('a plain title');
	});
});

describe('toRfc822', () => {
	it('formats an ISO calendar date as RFC-822 at UTC midnight', () => {
		expect(toRfc822('2026-09-10')).toBe('Thu, 10 Sep 2026 00:00:00 GMT');
	});

	it('handles single-digit days correctly', () => {
		expect(toRfc822('2023-02-10')).toBe('Fri, 10 Feb 2023 00:00:00 GMT');
	});
});

describe('makeCdataSafe / wrapCdata', () => {
	it('splits an embedded ]]> so it cannot terminate the CDATA section', () => {
		const input = 'before ]]> after';
		expect(makeCdataSafe(input)).toBe('before ]]]]><![CDATA[> after');
	});

	it('wraps content in a CDATA section', () => {
		expect(wrapCdata('<p>hi</p>')).toBe('<![CDATA[<p>hi</p>]]>');
	});

	it('round-trips embedded ]]> through a real XML parser without truncation', () => {
		const malicious = ']]><script>alert(1)</script><![CDATA[';
		const xml = `<root>${wrapCdata(malicious)}</root>`;
		const parsed = new XMLParser({ cdataPropName: '__cdata' }).parse(xml);
		expect(readCdata(parsed.root)).toBe(malicious);
	});
});

describe('applySubAndSuperMarkers', () => {
	it('replaces {super:x} and {sub:x} markers with real tags', () => {
		const html = '<p>Espresso Getting Shit Done{super:TM} is real{sub:ish}.</p>';
		expect(applySubAndSuperMarkers(html)).toBe(
			'<p>Espresso Getting Shit Done<sup>TM</sup> is real<sub>ish</sub>.</p>'
		);
	});

	it('handles multiple markers of the same kind', () => {
		const html = '{super:superscript} and {sub:subscript}';
		expect(applySubAndSuperMarkers(html)).toBe('<sup>superscript</sup> and <sub>subscript</sub>');
	});

	it('leaves text without markers untouched', () => {
		expect(applySubAndSuperMarkers('<p>no markers here</p>')).toBe('<p>no markers here</p>');
	});
});

describe('absolutizeHtmlUrls', () => {
	const origin = 'https://example.com';

	it('makes root-relative src attributes absolute', () => {
		expect(absolutizeHtmlUrls('<img src="/images/foo.webp" />', origin)).toBe(
			'<img src="https://example.com/images/foo.webp" />'
		);
	});

	it('makes root-relative href attributes absolute', () => {
		expect(absolutizeHtmlUrls('<a href="/about#connect">contact</a>', origin)).toBe(
			'<a href="https://example.com/about#connect">contact</a>'
		);
	});

	it('leaves already-absolute URLs untouched', () => {
		const html = '<img src="https://cdn.example.org/a.webp" /><a href="https://other.com">x</a>';
		expect(absolutizeHtmlUrls(html, origin)).toBe(html);
	});

	it('leaves protocol-relative URLs untouched', () => {
		const html = '<img src="//cdn.example.org/a.webp" />';
		expect(absolutizeHtmlUrls(html, origin)).toBe(html);
	});
});

describe('serializeRssFeed', () => {
	const baseFeed = {
		title: 'Alice Alexandra Moore',
		link: 'https://www.alicealexandra.com/blog',
		description: "Blog entries and writing that doesn't quite fit anywhere else.",
		feedUrl: 'https://www.alicealexandra.com/rss.xml',
		language: 'en',
		items: [
			{
				slug: 'were-all-right-here',
				title: "We're all right here",
				description: 'On white despair and wanting more of our lives back.',
				contentHtml: '<p>Body with {super:TM} and <img src="/images/a.webp" /></p>',
				publicationDate: '2026-09-10',
				category: 'Lyric'
			},
			{
				slug: 'coming-soon',
				title: 'Coming soon',
				description: 'A placeholder.',
				contentHtml: '<p>]]> danger</p>',
				publicationDate: '2023-02-10'
			}
		]
	};

	it('produces well-formed XML with the required RSS 2.0 elements', () => {
		const xml = serializeRssFeed(baseFeed);
		const parsed = new XMLParser({
			ignoreAttributes: false,
			cdataPropName: '__cdata'
		}).parse(xml);

		const channel = parsed.rss.channel;
		expect(channel.title).toBe('Alice Alexandra Moore');
		expect(channel.link).toBe('https://www.alicealexandra.com/blog');
		expect(channel.description).toContain("doesn't quite fit anywhere else");
		expect(channel.language).toBe('en');
		expect(channel['atom:link']['@_href']).toBe('https://www.alicealexandra.com/rss.xml');
		expect(channel['atom:link']['@_rel']).toBe('self');
		expect(channel.lastBuildDate).toBe(toRfc822('2026-09-10'));

		const items = Array.isArray(channel.item) ? channel.item : [channel.item];
		expect(items).toHaveLength(2);
		expect(items[0].title).toBe("We're all right here");
		expect(items[0].link).toBe('https://www.alicealexandra.com/blog/were-all-right-here');
		expect(items[0].guid['#text']).toBe('https://www.alicealexandra.com/blog/were-all-right-here');
		expect(items[0].guid['@_isPermaLink']).toBe('true');
		expect(items[0].category).toBe('Lyric');
		expect(items[0].pubDate).toBe(toRfc822('2026-09-10'));
	});

	it('absolutizes URLs and replaces sub/super markers inside content:encoded', () => {
		const xml = serializeRssFeed(baseFeed);
		expect(xml).toContain('<sup>TM</sup>');
		expect(xml).not.toMatch(/\{super:|\{sub:/);
		expect(xml).toContain('src="https://www.alicealexandra.com/images/a.webp"');
	});

	it('keeps embedded ]]> from breaking the CDATA section', () => {
		const xml = serializeRssFeed(baseFeed);
		const parsed = new XMLParser({ cdataPropName: '__cdata' }).parse(xml);
		// If parsing succeeds and content:encoded contains our marker text, the
		// CDATA was not truncated early by the embedded "]]>".
		const items = Array.isArray(parsed.rss.channel.item)
			? parsed.rss.channel.item
			: [parsed.rss.channel.item];
		const text = readCdata(items[1]['content:encoded']);
		expect(text).toContain('danger');
		expect(text).toBe('<p>]]> danger</p>');
	});

	it('falls back to the epoch when there are no items', () => {
		const xml = serializeRssFeed({ ...baseFeed, items: [] });
		expect(xml).toContain(`<lastBuildDate>${new Date(0).toUTCString()}</lastBuildDate>`);
	});
});
