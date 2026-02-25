import { dev } from '$app/environment';

export const CLOUDFLARE_IMAGE_VARIANTS = [320, 640, 960, 1200];
export const IMAGE_DOMAIN = 'images.alicealexandra.com';
export const R2_PUBLIC_DOMAIN = 'pub-a1233e2ec22b407fb8ef2b8a06521728.r2.dev';

/**
 * Generates an Optimized Image URL.
 * In production, it uses Vercel's built-in Image Optimization.
 * In development, it falls back to the raw R2 public URL.
 */
export function getOptimizedImageUrl(srcUrl: string, width: number): string {
	if (!srcUrl) return srcUrl;
	
	let resolvedUrl = srcUrl;
	if (srcUrl.includes(IMAGE_DOMAIN)) {
		resolvedUrl = srcUrl.replace(IMAGE_DOMAIN, R2_PUBLIC_DOMAIN);
	}
	
	const w = CLOUDFLARE_IMAGE_VARIANTS.includes(width) ? width : Math.max(...CLOUDFLARE_IMAGE_VARIANTS);
	
	// Local dev doesn't have the Vercel Image Optimization edge API running on standard vite dev
	if (dev) {
		return resolvedUrl;
	}
	
	try {
		return `/_vercel/image?url=${encodeURIComponent(resolvedUrl)}&w=${w}&q=80`;
	} catch (e) {
		return resolvedUrl;
	}
}

/**
 * Generates a srcset string using Vercel Image Optimization variants.
 */
export function generateSrcSet(srcUrl: string): string | undefined {
	if (!srcUrl || !srcUrl.includes(IMAGE_DOMAIN)) return undefined;
	
	// Temporarily skip srcset generation locally so images just load once from the raw URL
	if (dev) return undefined;
	
	return CLOUDFLARE_IMAGE_VARIANTS
		.map((w) => `${getOptimizedImageUrl(srcUrl, w)} ${w}w`)
		.join(', ');
}
