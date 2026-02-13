import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('chrome token contract', () => {
	it('uses chrome semantic tokens in chrome stylesheet', () => {
		const cssPath = resolve(process.cwd(), 'src/lib/styles/chrome.css');
		const css = readFileSync(cssPath, 'utf8');

		const requiredTokens = [
			'--chrome-bg',
			'--chrome-surface',
			'--chrome-text',
			'--chrome-border',
			'--chrome-accent'
		];

		for (const token of requiredTokens) {
			expect(
				css.includes(token),
				`chrome-token-contract: missing --chrome-* token "${token}"`
			).toBe(true);
		}

		expect(css.includes('var(--color-')).toBe(false);
	});
});
