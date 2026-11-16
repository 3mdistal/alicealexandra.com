import { describe, expect, it } from 'vitest';
import { readImageSize } from './image-size';

/** Bytes from ASCII strings and byte lists, in order. */
const bytes = (...parts: (string | number[])[]) =>
	Uint8Array.from(
		parts.flatMap((part) =>
			typeof part === 'string' ? [...part].map((char) => char.charCodeAt(0)) : part
		)
	);
const le16 = (n: number) => [n & 0xff, n >> 8];
const le24 = (n: number) => [n & 0xff, (n >> 8) & 0xff, n >> 16];
const le32 = (n: number) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, n >>> 24];
const be16 = (n: number) => [n >> 8, n & 0xff];
const be32 = (n: number) => [n >>> 24, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
const riff = (chunk: string, data: number[]) =>
	bytes('RIFF', le32(0), 'WEBP', chunk, le32(0), data);

describe('readImageSize', () => {
	it('reads an extended WebP canvas, stored minus one', () => {
		const file = riff('VP8X', [0x10, 0, 0, 0, ...le24(1199), ...le24(1153)]);

		expect(readImageSize(file)).toEqual({ width: 1200, height: 1154 });
	});

	it('reads a lossy WebP frame, ignoring its scale bits', () => {
		const frameStart = [0, 0, 0, 0x9d, 0x01, 0x2a];
		const file = riff('VP8 ', [...frameStart, ...le16(1200 | 0x4000), ...le16(751 | 0x8000)]);

		expect(readImageSize(file)).toEqual({ width: 1200, height: 751 });
	});

	it('reads a lossless WebP, packed minus one after its signature', () => {
		const packed = 1199 | (1422 << 14) | (1 << 28);
		const file = riff('VP8L', [0x2f, ...le32(packed), 0, 0, 0, 0, 0]);

		expect(readImageSize(file)).toEqual({ width: 1200, height: 1423 });
	});

	it('reads PNG, GIF and JPEG sizes', () => {
		const png = bytes(
			[0x89],
			'PNG',
			[0x0d, 0x0a, 0x1a, 0x0a],
			be32(13),
			'IHDR',
			be32(1600),
			be32(900)
		);
		const gif = bytes('GIF89a', le16(480), le16(270));
		// An APP0 segment and a Huffman table come before the frame that holds the size.
		const jpeg = bytes(
			[0xff, 0xd8],
			[0xff, 0xe0],
			be16(16),
			new Array(14).fill(0),
			[0xff, 0xc4],
			be16(4),
			[0, 0],
			[0xff, 0xc0],
			be16(17),
			[8],
			be16(1080),
			be16(1920),
			[3, 0, 0]
		);

		expect(readImageSize(png)).toEqual({ width: 1600, height: 900 });
		expect(readImageSize(gif)).toEqual({ width: 480, height: 270 });
		expect(readImageSize(jpeg)).toEqual({ width: 1920, height: 1080 });
	});

	it('returns null for other files and for bytes that stop before the size', () => {
		const vp8x = riff('VP8X', [0x10, 0, 0, 0, ...le24(1199), ...le24(1153)]);

		expect(readImageSize(bytes('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
		expect(readImageSize(new Uint8Array())).toBeNull();
		expect(readImageSize(vp8x.subarray(0, 28))).toBeNull();
		expect(readImageSize(bytes([0xff, 0xd8, 0xff, 0xe0], be16(16)))).toBeNull();
	});
});
