import { expect, test } from '@playwright/test';

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
