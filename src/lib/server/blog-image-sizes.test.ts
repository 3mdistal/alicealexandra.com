import { describe, expect, it, vi } from 'vitest';
import { measurePostImages } from './blog-image-sizes';

/** The first 24 bytes of a PNG of the given size. */
function pngHead(width: number, height: number): ArrayBuffer {
	const head = new Uint8Array(24);
	const view = new DataView(head.buffer);
	head.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
	view.setUint32(16, width);
	view.setUint32(20, height);
	return head.buffer;
}

// Each test uses its own URLs, since sizes stay cached for the life of the server.
describe('measurePostImages', () => {
	it('measures each image from the start of its file', async () => {
		const fetchImage = vi.fn(async () => new Response(pngHead(1200, 800), { status: 206 }));
		const markdown =
			'![A](https://example.com/measure/a.png)\n\n![B](https://example.com/measure/a.png)';

		const sizes = await measurePostImages(markdown, fetchImage);

		expect(sizes).toEqual({ 'https://example.com/measure/a.png': { width: 1200, height: 800 } });
		expect(fetchImage).toHaveBeenCalledTimes(1);
		expect(fetchImage).toHaveBeenCalledWith(
			'https://example.com/measure/a.png',
			expect.objectContaining({ headers: { Range: 'bytes=0-65535' } })
		);
	});

	it('remembers sizes it has measured', async () => {
		const fetchImage = vi.fn(async () => new Response(pngHead(640, 480)));
		const markdown = '![A](https://example.com/cached/a.png)';

		await measurePostImages(markdown, fetchImage);
		const sizes = await measurePostImages(markdown, fetchImage);

		expect(sizes).toEqual({ 'https://example.com/cached/a.png': { width: 640, height: 480 } });
		expect(fetchImage).toHaveBeenCalledTimes(1);
	});

	it('leaves out images it cannot fetch or read, and retries a failed fetch later', async () => {
		const markdown = [
			'![Missing](https://example.com/failing/missing.png)',
			'![Down](https://example.com/failing/down.png)',
			'![Vector](https://example.com/failing/vector.svg)'
		].join('\n\n');
		const failing = vi.fn(async (url: string | URL | Request) => {
			if (String(url).endsWith('down.png')) {
				throw new TypeError('fetch failed');
			}

			return String(url).endsWith('missing.png')
				? new Response('Not found', { status: 404 })
				: new Response('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
		});

		expect(await measurePostImages(markdown, failing)).toEqual({});

		const working = vi.fn(async () => new Response(pngHead(300, 200)));
		const sizes = await measurePostImages('![Down](https://example.com/failing/down.png)', working);

		expect(sizes).toEqual({ 'https://example.com/failing/down.png': { width: 300, height: 200 } });
	});
});
