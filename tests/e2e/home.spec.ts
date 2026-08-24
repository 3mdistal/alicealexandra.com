import { expect, test } from '@playwright/test';

test('homepage negotiates machine-readable Markdown without changing HTML defaults', async ({
	page,
	request
}) => {
	const htmlResponse = await request.get('/', { headers: { Accept: 'text/html' } });
	expect(htmlResponse.status()).toBe(200);
	expect(htmlResponse.headers()['content-type']).toContain('text/html');
	expect(htmlResponse.headers()['vary']).toContain('Accept');

	const markdownResponse = await request.get('/', {
		headers: { Accept: 'text/markdown, text/html;q=0.8' }
	});
	expect(markdownResponse.status()).toBe(200);
	expect(markdownResponse.headers()['content-type']).toContain('text/markdown');
	expect(markdownResponse.headers()['vary']).toContain('Accept');
	expect(await markdownResponse.text()).toContain('## When to use this site');

	const headResponse = await request.head('/', { headers: { Accept: 'text/markdown' } });
	expect(headResponse.status()).toBe(200);
	expect(headResponse.headers()['content-type']).toContain('text/markdown');
	expect(await headResponse.body()).toHaveLength(0);

	const unsupportedResponse = await request.get('/', { headers: { Accept: 'application/pdf' } });
	expect(unsupportedResponse.status()).toBe(406);
	expect(unsupportedResponse.headers()['vary']).toContain('Accept');

	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1, name: 'tempo immaterial' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'about' })).toBeVisible();
	await expect(page.getByText('When to use this site')).toHaveCount(0);
});

test('homepage exposes canonical personal identity metadata', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		'https://www.alicealexandra.com/'
	);
	await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
		'content',
		'https://www.alicealexandra.com/'
	);

	const structuredDataText = await page.locator('script[type="application/ld+json"]').textContent();
	const structuredData = JSON.parse(structuredDataText ?? '{}');
	expect(structuredData).toMatchObject({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Alice Alexandra Moore',
		alternateName: 'Tempo Immaterial',
		url: 'https://www.alicealexandra.com/'
	});
});

test('machine-readable discovery files are valid and exclude private routes', async ({
	request
}) => {
	const llmsResponse = await request.get('/llms.txt');
	expect(llmsResponse.status()).toBe(200);
	expect(llmsResponse.headers()['content-type']).toContain('text/plain');
	expect(await llmsResponse.text()).toContain('## When to use this site');

	const sitemapResponse = await request.get('/sitemap.xml');
	expect(sitemapResponse.status()).toBe(200);
	expect(sitemapResponse.headers()['content-type']).toContain('application/xml');
	const sitemap = await sitemapResponse.text();
	expect(sitemap).toContain('<loc>https://www.alicealexandra.com/</loc>');
	expect(sitemap).toContain('<loc>https://www.alicealexandra.com/about</loc>');
	expect(sitemap).not.toContain('/owner');
	expect(sitemap).not.toContain('/api/');
	expect(sitemap).not.toContain('/unsubscribe');
});

test('homepage renders', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle('Tempo Immaterial');
});

test('keyboard focus is visible on homepage links', async ({ page }) => {
	await page.goto('/');
	await page.keyboard.press('Tab');

	const skipLinkFocused = await page.evaluate(() => {
		const active = document.activeElement;
		return Boolean(active && active.matches('a.skip-link'));
	});

	if (skipLinkFocused) {
		await page.keyboard.press('Tab');
	}

	const activeLink = page.locator('a.homepage-section-link:focus-visible').first();
	await expect(activeLink).toBeVisible();

	const outlineWidth = await activeLink.evaluate((node) => getComputedStyle(node).outlineWidth);
	expect(outlineWidth).not.toBe('0px');
});

test('reduced motion collapses global duration tokens', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');

	const durationBase = await page.evaluate(() =>
		getComputedStyle(document.documentElement).getPropertyValue('--duration-base').trim()
	);
	expect(durationBase).toBe('1ms');
});
