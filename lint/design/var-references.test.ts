import { describe, expect, it } from 'vitest';
import { findVarReferences } from './var-references.ts';

describe('findVarReferences', () => {
	it('finds a plain reference and where it sits in the value', () => {
		const value = ' 0 var(--space-4)';
		const [reference] = findVarReferences(value);
		expect(reference).toEqual({ name: '--space-4', hasFallback: false, start: 3, end: 17 });
		expect(value.slice(reference?.start, reference?.end)).toBe('var(--space-4)');
	});

	it('treats any comma, even an empty fallback, as a fallback', () => {
		expect(findVarReferences('var(--a, 1px) var(--b,)').map((r) => r.hasFallback)).toEqual([
			true,
			true
		]);
	});

	it('finds references nested in math and in fallbacks', () => {
		expect(
			findVarReferences('calc(var(--a) * 2) var(--b, var(--c))').map(({ name, hasFallback }) => ({
				name,
				hasFallback
			}))
		).toEqual([
			{ name: '--a', hasFallback: false },
			{ name: '--b', hasFallback: true },
			{ name: '--c', hasFallback: false }
		]);
	});

	it('ignores other functions and malformed var() calls', () => {
		expect(findVarReferences('env(safe-area-inset-top) var() var(  )')).toEqual([]);
	});
});
