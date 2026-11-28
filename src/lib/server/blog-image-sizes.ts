import { readImageSize, type ImageSize } from '#lib/blog/image-size.ts';
import { postImageUrls } from '#lib/blog/render-markdown.ts';

/** Enough of a file to reach its size: WebP, PNG and GIF hold it in 30 bytes, a JPEG after its metadata. */
const HEAD_BYTES = 64 * 1024;
const TIMEOUT_MS = 5000;

// Posts render once each at build time, but the dev server reloads them on every visit.
const measured = new Map<string, Promise<ImageSize | null>>();

/**
 * Each of a post's images' sizes by URL, read from the start of its file. An image that can't be
 * fetched or read is left out, and renders without a size, as before.
 */
export async function measurePostImages(
	markdown: string,
	fetchImage: typeof fetch = fetch
): Promise<Record<string, ImageSize>> {
	const sizes: Record<string, ImageSize> = {};

	await Promise.all(
		postImageUrls(markdown).map(async (url) => {
			const size = await measureImage(url, fetchImage);

			if (size) {
				sizes[url] = size;
			}
		})
	);

	return sizes;
}

function measureImage(url: string, fetchImage: typeof fetch): Promise<ImageSize | null> {
	let size = measured.get(url);

	if (!size) {
		size = fetchHead(url, fetchImage).then(readImageSize, () => {
			// Let a later visit retry an image that failed to load.
			measured.delete(url);
			return null;
		});
		measured.set(url, size);
	}

	return size;
}

async function fetchHead(url: string, fetchImage: typeof fetch): Promise<Uint8Array> {
	const response = await fetchImage(url, {
		headers: { Range: `bytes=0-${HEAD_BYTES - 1}` },
		signal: AbortSignal.timeout(TIMEOUT_MS)
	});

	if (!response.ok) {
		throw new Error(`${response.status} fetching ${url}`);
	}

	return new Uint8Array(await response.arrayBuffer());
}
