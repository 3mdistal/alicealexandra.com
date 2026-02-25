export const CLOUDFLARE_IMAGE_VARIANTS = [320, 640, 960, 1200];
export const IMAGE_DOMAIN = 'images.alicealexandra.com';

/**
 * Generates a Cloudflare Image Resizing URL for a given source URL and width.
 * Only supports sizes in CLOUDFLARE_IMAGE_VARIANTS.
 */
export function getOptimizedImageUrl(srcUrl: string, width: number): string {
	if (!srcUrl) return srcUrl;
	if (!srcUrl.includes(IMAGE_DOMAIN)) return srcUrl;
	
	const w = CLOUDFLARE_IMAGE_VARIANTS.includes(width) ? width : Math.max(...CLOUDFLARE_IMAGE_VARIANTS);
	
	try {
		const url = new URL(srcUrl);
		return `https://${IMAGE_DOMAIN}/cdn-cgi/image/width=${w},format=auto${url.pathname}`;
	} catch (e) {
		return srcUrl;
	}
}

/**
 * Generates a srcset string for a given source URL using allowed variants.
 */
export function generateSrcSet(srcUrl: string): string | undefined {
	if (!srcUrl || !srcUrl.includes(IMAGE_DOMAIN)) return undefined;
	
	return CLOUDFLARE_IMAGE_VARIANTS
		.map((w) => `${getOptimizedImageUrl(srcUrl, w)} ${w}w`)
		.join(', ');
}
