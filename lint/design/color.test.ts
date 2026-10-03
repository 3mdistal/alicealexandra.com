import { describe, expect, it } from 'vitest';
import { composite, contrastRatio, findRawColors, mixColors, parseColor } from './color.ts';

describe('parseColor', () => {
	it('reads hex, rgb(), hsl() and named colors', () => {
		expect(parseColor('#0ea5e9')).toEqual({ r: 14, g: 165, b: 233, a: 1 });
		expect(parseColor('#fff8')).toEqual({ r: 255, g: 255, b: 255, a: 0x88 / 255 });
		expect(parseColor('rgba(15, 23, 42, 0.12)')).toEqual({ r: 15, g: 23, b: 42, a: 0.12 });
		expect(parseColor('rgb(100% 0% 0% / 50%)')).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
		expect(parseColor('hsl(120 100% 25%)')).toEqual({ r: 0, g: 127.5, b: 0, a: 1 });
		expect(parseColor('White')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
	});

	it("returns undefined for anything that isn't one plain color", () => {
		expect(parseColor('transparent')).toBeUndefined();
		expect(parseColor('oklch(70% 0.1 200)')).toBeUndefined();
		expect(parseColor('0 1px 3px #000')).toBeUndefined();
		expect(parseColor('var(--color-bg)')).toBeUndefined();
	});
});

describe('findRawColors', () => {
	it('finds each literal color with its offsets, skipping keywords, urls and variables', () => {
		const value =
			"0 1px 2px black, inset 0 0 0 1px rgb(0 0 0 / 10%), url('#fff') var(--x, #abc) currentColor transparent";
		expect(findRawColors(value).map(({ text, start, end }) => ({ text, start, end }))).toEqual([
			{ text: 'black', start: 10, end: 15 },
			{ text: 'rgb(0 0 0 / 10%)', start: 33, end: 49 },
			{ text: '#abc', start: 72, end: 76 }
		]);
	});
});

describe('color math', () => {
	it('mixes with premultiplied alpha, like color-mix(in srgb, …)', () => {
		const slate = { r: 15, g: 23, b: 42, a: 1 };
		const transparent = { r: 0, g: 0, b: 0, a: 0 };
		const mixed = mixColors(slate, 0.12, transparent, 0.88);
		for (const channel of ['r', 'g', 'b', 'a'] as const) {
			expect(mixed[channel]).toBeCloseTo({ ...slate, a: 0.12 }[channel], 9);
		}
	});

	it('paints a translucent color over an opaque one', () => {
		const black = { r: 0, g: 0, b: 0, a: 0.5 };
		expect(composite(black, { r: 255, g: 255, b: 255, a: 1 })).toEqual({
			r: 127.5,
			g: 127.5,
			b: 127.5,
			a: 1
		});
	});

	it('measures WCAG contrast', () => {
		const white = { r: 255, g: 255, b: 255, a: 1 };
		expect(contrastRatio(white, { r: 0, g: 0, b: 0, a: 1 })).toBe(21);
		expect(contrastRatio(white, white)).toBe(1);
		expect(contrastRatio(white, parseColor('#767676')!)).toBeCloseTo(4.54, 2);
	});
});
