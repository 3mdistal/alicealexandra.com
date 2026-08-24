import { describe, expect, it } from 'vitest';
import { selectHomepageRepresentation } from './content-negotiation';

describe('selectHomepageRepresentation', () => {
	it.each([
		[null, 'text/html'],
		['', 'text/html'],
		['*/*', 'text/html'],
		['text/html', 'text/html'],
		['text/markdown', 'text/markdown'],
		['text/markdown, text/html;q=0.8', 'text/markdown'],
		['text/html;q=0.8, text/markdown;q=0.5', 'text/html'],
		['text/markdown, text/html', 'text/markdown'],
		['text/*;q=0.5, text/markdown;q=0.5', 'text/markdown'],
		['text/markdown;q=0, */*', 'text/html'],
		['application/json, */*;q=0.1', 'text/html'],
		['application/json', null],
		['text/html;q=0, text/markdown;q=0', null],
		['not-a-media-range', null]
	])('selects %s as %s', (header, expected) => {
		expect(selectHomepageRepresentation(header)).toBe(expected);
	});
});
