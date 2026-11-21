import { describe, expect, it } from 'vitest';
import { calculateBlogReadTimeFromContent } from './read-time';

const words = (count: number) => Array.from({ length: count }, () => 'word').join(' ');

describe('calculateBlogReadTimeFromContent', () => {
	it('says how long the post takes to read', () => {
		expect(calculateBlogReadTimeFromContent(words(2700))).toBe('12 min read');
	});

	it('rounds a partial minute up', () => {
		expect(calculateBlogReadTimeFromContent(words(226))).toBe('2 min read');
	});

	it('never says less than a minute, even for an empty post', () => {
		expect(calculateBlogReadTimeFromContent('')).toBe('1 min read');
		expect(calculateBlogReadTimeFromContent(words(3))).toBe('1 min read');
	});
});
