// @ts-nocheck
import { describe, expect, it } from 'vitest';
import { parseBuilderSnapshotFile } from './builder';

describe('builder snapshot parsing', () => {
	it('parses a valid snapshot', () => {
		const snapshot = parseBuilderSnapshotFile({
			version: 1,
			generatedAt: '2026-01-27T00:00:00.000Z',
			dataUpdatedAt: '2026-01-27T00:00:00.000Z',
			source: {
				site: 'builder.io',
				query: {
					authorAllowlist: ['Alice Moore'],
					section: 'blog'
				}
			},
			data: [
				{
					id: 'https://www.builder.io/blog/test-post',
					title: 'Test Post',
					description: 'Short summary.',
					url: 'https://www.builder.io/blog/test-post',
					publishedAt: '2026-01-20T00:00:00.000Z'
				}
			]
		});

		expect(snapshot.data).toHaveLength(1);
		expect(snapshot.data[0]?.url).toBe('https://www.builder.io/blog/test-post');
	});

	it('rejects invalid URLs', () => {
		expect(() =>
			parseBuilderSnapshotFile({
				version: 1,
				generatedAt: '2026-01-27T00:00:00.000Z',
				dataUpdatedAt: '2026-01-27T00:00:00.000Z',
				source: {
					site: 'builder.io',
					query: {
						authorAllowlist: ['Alice Moore'],
						section: 'blog'
					}
				},
				data: [
					{
						id: 'bad',
						title: 'Bad',
						description: 'Nope',
						url: 'ftp://builder.io/blog/test'
					}
				]
			})
		).toThrow(/Builder snapshot:/);
	});
});
