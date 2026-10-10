import { expect, test, type Page } from '@playwright/test';
import { serveOffSiteFromCache } from './off-site.ts';

// One page per template. Arcade games are left out because they draw on a canvas every frame.
const PAGES = {
	home: '/',
	about: '/about',
	blog: '/blog',
	'blog-post': '/blog/were-all-right-here',
	career: '/career',
	'career-builder': '/career/builder',
	'career-vercel': '/career/vercel',
	news: '/news',
	studio: '/studio',
	arcade: '/studio/arcade',
	hfc: '/studio/hfc',
	'hfc-poem': '/studio/hfc/dehiscence',
	illustrations: '/studio/illustrations',
	postcards: '/studio/postcards',
	postcard: '/studio/postcards/the-tinker',
	'tall-tales': '/studio/tall-tales',
	'tall-tale': '/studio/tall-tales/the-goat-hunters',
	unsubscribe: '/unsubscribe'
};

const VIEWPORTS: Array<[number, number]> = [
	[390, 844],
	[1024, 768],
	[1440, 900]
];

/** Replaces `Math.random` with a seeded generator so anything random lands the same way each run. */
function seedRandom() {
	let seed = 1;
	Math.random = () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Loads every image and runs scroll-triggered reveals, then returns to the top. */
async function settle(page: Page) {
	await page.evaluate(async () => {
		for (const image of document.images) image.loading = 'eager';
		for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
			window.scrollTo(0, y);
			await new Promise((resolve) => requestAnimationFrame(resolve));
		}
		window.scrollTo(0, 0);
		await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
		await document.fonts.ready;
	});
}

for (const colorScheme of ['light', 'dark'] as const) {
	test.describe(colorScheme, () => {
		test.use({ colorScheme });

		for (const [name, path] of Object.entries(PAGES)) {
			for (const [width, height] of VIEWPORTS) {
				test(`${name} at ${width}×${height}`, async ({ page }) => {
					await page.addInitScript(seedRandom);
					await serveOffSiteFromCache(page);
					await page.setViewportSize({ width, height });
					await page.goto(path, { waitUntil: 'networkidle' });
					if (name === 'home') await expect(page.locator('nav')).toHaveCSS('opacity', '1');
					await settle(page);
					await expect(page).toHaveScreenshot(`${name}-${colorScheme}-${width}.png`, {
						fullPage: true
					});
				});
			}
		}
	});
}
