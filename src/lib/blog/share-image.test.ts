import { describe, expect, it } from 'vitest';
import { shareImageUrl } from './share-image';

const params = (url: string) => Object.fromEntries(new URL(url).searchParams);

describe('shareImageUrl', () => {
	it('asks Unsplash for a 1200px JPEG, keeping the cover’s other settings', () => {
		const cover =
			'https://images.unsplash.com/photo-1579286102752-282ce1c4f9bc?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb';

		const url = shareImageUrl(cover);

		expect(url.startsWith('https://images.unsplash.com/photo-1579286102752-282ce1c4f9bc?')).toBe(
			true
		);
		expect(params(url)).toEqual({
			ixlib: 'rb-4.0.3',
			q: '80',
			fm: 'jpg',
			crop: 'entropy',
			cs: 'srgb',
			w: '1200'
		});
	});

	it('replaces an Unsplash cover’s own width and drops automatic formats', () => {
		const cover =
			'https://images.unsplash.com/photo-1586672807386-b69d6b527248?auto=format&fit=crop&w=1600&q=85';

		expect(params(shareImageUrl(cover))).toEqual({ fit: 'crop', w: '1200', q: '80', fm: 'jpg' });
	});

	it('leaves covers hosted anywhere else as they are', () => {
		const covers = [
			'https://pub-a1233e2ec22b407fb8ef2b8a06521728.r2.dev/blog/images/clawdbot-og.webp',
			'https://pbs.twimg.com/media/FrHWG4WXoBM_2dz?format=png&name=900x900',
			'https://www.notion.so/images/page-cover/met_william_morris_1877_willow.jpg'
		];

		for (const cover of covers) expect(shareImageUrl(cover)).toBe(cover);
	});

	it('leaves an empty or relative cover as it is', () => {
		expect(shareImageUrl('')).toBe('');
		expect(shareImageUrl('/images/cover.jpg')).toBe('/images/cover.jpg');
	});
});
