import { expect, test, type Page } from '@playwright/test';

const SECTIONS = ['about', 'studio', 'career', 'blog', 'news'] as const;

// Desktop, short laptops, tablets, phones in both orientations, and large monitors.
const VIEWPORTS: Array<[number, number]> = [
	[1920, 1080],
	[1440, 900],
	[1280, 720],
	[1280, 600],
	[1280, 500],
	[1024, 600],
	[1000, 600],
	[1024, 1366],
	[768, 1024],
	[430, 932],
	[390, 844],
	[375, 667],
	[360, 740],
	[932, 430],
	[844, 390],
	[740, 360],
	[667, 375],
	[2560, 1440]
];

async function settledHomepage(page: Page, width: number, height: number) {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.setViewportSize({ width, height });
	await page.goto('/');
	await expect(page.locator('nav')).toHaveCSS('opacity', '1');
	await page.evaluate(() => document.fonts.ready);
}

/** Where each label's text is drawn, and which band the browser hit-tests there. */
function inspectLayout(page: Page) {
	return page.evaluate((sections) => {
		const bandAt = (x: number, y: number) =>
			document.elementFromPoint(x, y)?.closest('.homepage-section')?.classList[1] ?? 'none';
		const textBox = (el: Element) => {
			const range = document.createRange();
			range.selectNodeContents(el);
			return range.getBoundingClientRect();
		};
		const labels = sections.map((name) => {
			const box = textBox(document.querySelector(`.homepage-section-link.${name}`)!);
			const inset = 3;
			const points: Array<[number, number]> = [
				[box.left + box.width / 2, box.top + box.height / 2],
				[box.left + inset, box.top + inset],
				[box.right - inset, box.top + inset],
				[box.left + inset, box.bottom - inset],
				[box.right - inset, box.bottom - inset]
			];
			const hits = points.map(([x, y]) =>
				y < 0 || y > innerHeight || x < 0 || x > innerWidth ? 'offscreen' : bandAt(x, y)
			);
			return { name, hits };
		});
		const header = ['.logo', '.site-title', '.subtitle'].map((selector) => {
			const el = document.querySelector(selector)!;
			const box = selector === '.logo' ? el.getBoundingClientRect() : textBox(el);
			const covered = [0.1, 0.5, 0.9].some((fx) =>
				[0.2, 0.8].some(
					(fy) => bandAt(box.left + box.width * fx, box.top + box.height * fy) !== 'none'
				)
			);
			return { selector, covered };
		});
		return { labels, header };
	}, SECTIONS);
}

for (const [width, height] of VIEWPORTS) {
	test(`labels sit on their own bands and clear the header at ${width}x${height}`, async ({
		page
	}) => {
		await settledHomepage(page, width, height);
		const { labels, header } = await inspectLayout(page);

		for (const { name, hits } of labels) {
			expect(hits, `${name} label at ${width}x${height}`).toEqual(Array(hits.length).fill(name));
		}
		for (const { selector, covered } of header) {
			expect(covered, `${selector} covered by a band at ${width}x${height}`).toBe(false);
		}
	});
}

test('clicking where a label is drawn opens that section on a landscape phone', async ({
	page
}) => {
	await settledHomepage(page, 844, 390);
	const box = await page.locator('.homepage-section-link.about').boundingBox();
	await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
	await expect(page).toHaveURL(/\/about$/);
});

test('right and middle clicks do not navigate; modified clicks open a new tab', async ({
	page,
	context
}) => {
	await settledHomepage(page, 1280, 720);
	const about = page.locator('.homepage-section-link.about');

	await about.click({ button: 'right' });
	await page.keyboard.press('Escape');
	await page.waitForTimeout(1500);
	await expect(page).toHaveURL(/\/$/);

	const [popup] = await Promise.all([
		context.waitForEvent('page'),
		about.click({ modifiers: ['ControlOrMeta'] })
	]);
	await expect(popup).toHaveURL(/\/about$/);
	await page.waitForTimeout(1500);
	await expect(page).toHaveURL(/\/$/);
});

test('a plain click on a band away from its label navigates', async ({ page }) => {
	await settledHomepage(page, 1280, 720);
	const box = await page.locator('.homepage-section-link.news').boundingBox();
	await page.mouse.click(box!.x + box!.width + 150, box!.y + box!.height / 2);
	await expect(page).toHaveURL(/\/news$/);
});

test('reduced motion shows the bands in place without springing', async ({ page }) => {
	await settledHomepage(page, 1280, 720);
	const transforms = await page
		.locator('.homepage-section')
		.evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
	for (const transform of transforms) {
		expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transform);
	}
	await expect(page.locator('.site-title')).toHaveCSS('opacity', '1');
});

/** Contrast of a label's text against its (possibly translucent) pill over its band. */
function labelContrast(el: Element) {
	const toRgba = (color: string) => {
		const ctx = document.createElement('canvas').getContext('2d')!;
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, 1, 1);
		const [r = 0, g = 0, b = 0, a = 0] = ctx.getImageData(0, 0, 1, 1).data;
		return { r, g, b, a: a / 255 };
	};
	type Rgba = ReturnType<typeof toRgba>;
	const over = (fg: Rgba, bg: Rgba): Rgba => ({
		r: fg.r * fg.a + bg.r * (1 - fg.a),
		g: fg.g * fg.a + bg.g * (1 - fg.a),
		b: fg.b * fg.a + bg.b * (1 - fg.a),
		a: 1
	});
	const lum = ({ r, g, b }: Rgba) => {
		const f = (v: number) => {
			v /= 255;
			return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
		};
		return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
	};
	const band = toRgba(getComputedStyle(el.parentElement!).backgroundColor);
	const pill = over(toRgba(getComputedStyle(el).backgroundColor), band);
	const text = over(toRgba(getComputedStyle(el).color), pill);
	const [hi = 0, lo = 0] = [lum(text), lum(pill)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

for (const colorScheme of ['light', 'dark'] as const) {
	test(`resting labels meet contrast on a phone in ${colorScheme} mode`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce', colorScheme });
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');
		const ratios = await page
			.locator('.homepage-section-link')
			.evaluateAll(
				(links, fn) => links.map((el) => new Function(`return (${fn})`)()(el) as number),
				labelContrast.toString()
			);
		for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
	});

	test(`keyboard focus keeps labels readable in ${colorScheme} mode`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce', colorScheme });
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/');
		await expect(page.locator('nav')).toHaveCSS('opacity', '1');

		await page.keyboard.press('Tab');
		for (const name of SECTIONS) {
			await page.keyboard.press('Tab');
			const link = page.locator(`.homepage-section-link.${name}`);
			await expect(link).toBeFocused();
			await expect(link).not.toHaveCSS('outline-style', 'none');
			await page.waitForTimeout(250);
			const ratio = await link.evaluate(
				(el, fn) => new Function(`return (${fn})`)()(el) as number,
				labelContrast.toString()
			);
			expect(ratio, `${name} focused contrast`).toBeGreaterThanOrEqual(4.5);
		}
		await page.keyboard.press('Enter');
		await expect(page).toHaveURL(/\/news$/);
	});
}

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('the title and every section link are visible', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('nav')).toHaveCSS('opacity', '1');
		await expect(page.locator('.site-title')).toBeVisible();
		for (const name of SECTIONS) {
			await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
		}
	});
});

test('homepage has one heading, a main landmark, and plain section links', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('main')).toHaveCount(1);
	await expect(page.getByRole('heading')).toHaveCount(1);
	for (const name of SECTIONS) {
		await expect(page.getByRole('link', { name, exact: true })).not.toHaveAttribute('title');
	}
});

test('fonts are served from this site', async ({ page }) => {
	const thirdParty: string[] = [];
	page.on('request', (request) => {
		if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) thirdParty.push(request.url());
	});
	await page.goto('/');
	await page.evaluate(() => document.fonts.ready);
	expect(thirdParty).toEqual([]);
	expect(await page.evaluate(() => document.fonts.check('300 16px Spectral'))).toBe(true);
});
