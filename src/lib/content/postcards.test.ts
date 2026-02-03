import { describe, expect, it } from 'vitest';
import { normalizeHeroImage } from './postcards';

describe('normalizeHeroImage', () => {
	it('returns undefined for non-string values', () => {
		expect(normalizeHeroImage(null)).toBeUndefined();
		expect(normalizeHeroImage(42)).toBeUndefined();
	});

	it('extracts the first URL when concatenated', () => {
		const value =
			'https://ik.imagekit.io/teeny/afterlife.jpghttps://ik.imagekit.io/teeny/afterlife-2.jpg';
		expect(normalizeHeroImage(value)).toBe('https://ik.imagekit.io/teeny/afterlife.jpg');
	});

	it('extracts the first URL when separated by whitespace', () => {
		const value =
			'https://ik.imagekit.io/teeny/afterlife.jpg https://ik.imagekit.io/teeny/afterlife-2.jpg';
		expect(normalizeHeroImage(value)).toBe('https://ik.imagekit.io/teeny/afterlife.jpg');
	});

	it('strips surrounding quotes and whitespace', () => {
		const value = '  "https://ik.imagekit.io/teeny/afterlife.jpg"  ';
		expect(normalizeHeroImage(value)).toBe('https://ik.imagekit.io/teeny/afterlife.jpg');
	});

	it('rejects unsafe URLs containing quotes or parens', () => {
		expect(normalizeHeroImage("https://ik.imagekit.io/teeny/afterlife'.jpg")).toBeUndefined();
		expect(normalizeHeroImage('https://ik.imagekit.io/teeny/afterlife).jpg')).toBeUndefined();
	});

	it('returns undefined for invalid URLs', () => {
		expect(normalizeHeroImage('not a url')).toBeUndefined();
		expect(normalizeHeroImage('ftp://example.com/bad.jpg')).toBeUndefined();
	});
});
