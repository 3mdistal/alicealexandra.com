import { describe, expect, it } from 'vitest';
import type { Rgba } from './color.ts';
import { colorMixSwap, findGradients } from './gradient.ts';

const primitives = new Map<string, Rgba>([
	['--color-sky-500', { r: 14, g: 165, b: 233, a: 1 }],
	['--color-white', { r: 255, g: 255, b: 255, a: 1 }]
]);
const swap = (value: string) => colorMixSwap(findGradients(value)[0]!, primitives);

describe('findGradients', () => {
	it('finds each stop and where `in srgb` would go', () => {
		const value = '0 0 1px red, repeating-linear-gradient(45deg, #fff 0 4px, 20%, transparent 8px)';
		const [gradient] = findGradients(value);
		expect(gradient).toMatchObject({
			start: 13,
			end: value.length,
			hasColorSpace: false,
			colorSpaceInsert: { at: value.indexOf(',', 13), text: ' in srgb' }
		});
		expect(gradient?.stops.map(({ value }) => value)).toEqual(['#fff', 'transparent']);
		expect(findGradients('conic-gradient(red, blue)')[0]?.colorSpaceInsert).toEqual({
			at: 15,
			text: 'in srgb, '
		});
		expect(findGradients('linear-gradient(in hsl longer hue, red, blue)')[0]?.hasColorSpace).toBe(
			true
		);
	});
});

describe('colorMixSwap', () => {
	it('needs `in srgb` only when every stop is legacy and they differ in hue', () => {
		expect(swap('linear-gradient(#0ea5e9, rgba(255, 255, 255, 0.5))')).toBe('name-srgb');
		expect(swap('linear-gradient(hwb(0 0% 0%), hwb(0 0% 0%))')).toBe('name-srgb');
		expect(swap('linear-gradient(rgba(0, 0, 0, 0.9), black, rgb(0 0 0 / 0))')).toBe('same');
		expect(swap('linear-gradient(white, var(--color-white), transparent)')).toBe('same');
		expect(swap('linear-gradient(oklch(70% 0.1 200), white)')).toBe('same');
		expect(swap('linear-gradient(rgb(from red r g b / 0.5), white)')).toBe('same');
		expect(swap('linear-gradient(var(--color-bg), white)')).toBe('unknown');
		expect(swap('linear-gradient(currentColor, white)')).toBe('unknown');
	});
});
