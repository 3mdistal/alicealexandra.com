export interface ImageSize {
	width: number;
	height: number;
}

/**
 * An image's pixel size, read from the start of a WebP, PNG, GIF or JPEG file; null for anything
 * else, or when the bytes stop before the size.
 */
export function readImageSize(bytes: Uint8Array): ImageSize | null {
	const ascii = (start: number, length: number) =>
		String.fromCharCode(...bytes.subarray(start, start + length));
	const byte = (at: number) => bytes[at] ?? 0;
	const uint16le = (at: number) => byte(at) | (byte(at + 1) << 8);
	const uint16be = (at: number) => (byte(at) << 8) | byte(at + 1);
	const uint24le = (at: number) => uint16le(at) | (byte(at + 2) << 16);
	const uint32be = (at: number) => uint16be(at) * 0x10000 + uint16be(at + 2);
	const size = (width: number, height: number) =>
		width > 0 && height > 0 ? { width, height } : null;

	if (bytes.length >= 30 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') {
		switch (ascii(12, 4)) {
			// Extended: the canvas size, each stored minus one in 24 bits.
			case 'VP8X':
				return size(uint24le(24) + 1, uint24le(27) + 1);
			// Lossy: 14-bit sizes after the frame's start code.
			case 'VP8 ':
				return size(uint16le(26) & 0x3fff, uint16le(28) & 0x3fff);
			// Lossless: 14-bit sizes, each stored minus one, packed after the signature byte.
			case 'VP8L': {
				const bits = uint16le(21) | (uint16le(23) << 16);
				return size((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1);
			}
			default:
				return null;
		}
	}

	if (bytes.length >= 24 && ascii(1, 3) === 'PNG' && ascii(12, 4) === 'IHDR') {
		return size(uint32be(16), uint32be(20));
	}

	if (bytes.length >= 10 && ascii(0, 4) === 'GIF8') {
		return size(uint16le(6), uint16le(8));
	}

	if (bytes.length >= 4 && byte(0) === 0xff && byte(1) === 0xd8) {
		// Walk the segments to the first start-of-frame, which holds the size.
		let at = 2;

		while (at + 9 <= bytes.length && byte(at) === 0xff) {
			const marker = byte(at + 1);

			if (marker === 0xff) {
				at += 1;
				continue;
			}

			const isFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);

			if (isFrame) {
				return size(uint16be(at + 7), uint16be(at + 5));
			}

			at += 2 + uint16be(at + 2);
		}
	}

	return null;
}
