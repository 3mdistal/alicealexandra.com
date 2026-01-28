import { describe, expect, it } from 'vitest';
import builderPosts from './data/builder-posts.json';

describe('builder posts dataset', () => {
	it('contains sorted, unique entries with valid dates', () => {
		const payload = builderPosts as {
			schemaVersion: number;
			data: Array<{ id: string; datePublished: string }>;
		};

		expect(payload.schemaVersion).toBe(1);
		expect(payload.data.length).toBeGreaterThan(0);

		const ids = new Set<string>();
		for (let i = 0; i < payload.data.length; i += 1) {
			const entry = payload.data[i]!;
			expect(entry.id).toBeTruthy();
			expect(ids.has(entry.id)).toBe(false);
			ids.add(entry.id);

			const date = new Date(entry.datePublished);
			expect(Number.isNaN(date.getTime())).toBe(false);

			if (i > 0) {
				const prev = payload.data[i - 1]!;
				if (prev.datePublished === entry.datePublished) {
					expect(prev.id.localeCompare(entry.id) <= 0).toBe(true);
				} else {
					expect(prev.datePublished >= entry.datePublished).toBe(true);
				}
			}
		}
	});
});
