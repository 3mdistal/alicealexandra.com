import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadTokenManifest } from './token-manifest.ts';

const tokens = fileURLToPath(new URL('./fixtures/tokens.css', import.meta.url));

describe('loadTokenManifest', () => {
	it('keeps every definition of a token with the selectors and at-rules around it', () => {
		const { definitions } = loadTokenManifest([tokens]);
		expect(
			definitions.get('--color-accent')?.map(({ value, context }) => ({ value, context }))
		).toEqual([
			{ value: '#642e1a', context: [':root'] },
			{ value: '#dcc9c6', context: ['@media (prefers-color-scheme: dark)', ':root'] }
		]);
		expect(definitions.get('--color-bg')?.[0]).toMatchObject({
			value: 'var(--color-accent)',
			file: tokens,
			line: 17,
			context: ["[data-theme='blog']"]
		});
	});
});
