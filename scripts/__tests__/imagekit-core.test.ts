import { describe, expect, it } from 'vitest';
import {
	extractImageKitUrls,
	canonicalizeImageKitUrl,
	deriveKeyBase,
	resolveFinalKey,
	applyKeySuffix
} from '../imagekit-core.mjs';

describe('imagekit-core', () => {
	it('extracts ImageKit URLs from mixed text', () => {
		const input = `
			<img src="https://ik.imagekit.io/tempoimmaterial/studio/ink.png?updatedAt=1" />
			const url = 'https://ik.imagekit.io/tempoimmaterial/tr:w-1500/hymns%20for%20calliope/ruined%20piano?updatedAt=2';
		`;
		const urls = extractImageKitUrls(input);
		expect(urls).toHaveLength(2);
		expect(urls[0]).toContain('ik.imagekit.io/tempoimmaterial');
	});

	it('canonicalizes query and path transforms', () => {
		const url =
			'https://ik.imagekit.io/tempoimmaterial/tr:w-1500/hymns%20for%20calliope/ruined%20piano?tr=w-1500&updatedAt=1';
		const canonical = canonicalizeImageKitUrl(url);
		expect(canonical?.downloadUrl).toBe(
			'https://ik.imagekit.io/tempoimmaterial/hymns%20for%20calliope/ruined%20piano'
		);
	});

	it('derives key base with prefix', () => {
		const keyBase = deriveKeyBase('studio/ink.png', 'content-images');
		expect(keyBase).toBe('content-images/studio/ink.png');
	});

	it('resolves final key with content-type', () => {
		const finalKey = resolveFinalKey('studio/ink', 'image/png');
		expect(finalKey).toBe('studio/ink.png');
	});

	it('applies key suffix before extension', () => {
		const suffixed = applyKeySuffix('studio/ink.png', 'abcd1234');
		expect(suffixed).toBe('studio/ink-abcd1234.png');
	});
});
