/** The width link previews use; X and Facebook show large cards at 1200px. */
export const SHARE_IMAGE_WIDTH = 1200;

const UNSPLASH_HOST = 'images.unsplash.com';

/**
 * The URL a post's cover image should have in its link preview tags.
 *
 * Covers only appear in link previews, never on the page. Unsplash covers are stored as the
 * photographer's original, up to 4 MB, and Unsplash resizes on request, so ask it for a
 * 1200px-wide JPEG with the same shape. Any other cover is returned as it is.
 */
export function shareImageUrl(coverImage: string): string {
	let url: URL;
	try {
		url = new URL(coverImage);
	} catch {
		return coverImage;
	}
	if (url.hostname !== UNSPLASH_HOST) return coverImage;

	// `auto=format` would let a crawler that accepts AVIF or WebP get one, which some previews can't show.
	url.searchParams.delete('auto');
	url.searchParams.set('w', String(SHARE_IMAGE_WIDTH));
	url.searchParams.set('fm', 'jpg');
	url.searchParams.set('q', '80');
	return url.toString();
}
