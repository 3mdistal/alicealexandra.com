import { expect, test } from '@playwright/test';

test('skip link moves focus to content target', async ({ page }) => {
	await page.goto('/about');
	await page.keyboard.press('Tab');

	const skipLink = page.getByRole('link', { name: 'Skip to content' });
	await expect(skipLink).toBeFocused();
	await skipLink.press('Enter');

	const activeId = await page.evaluate(() => document.activeElement?.id ?? '');
	if (activeId !== 'content') {
		throw new Error('skip-link: target "#content" not focusable');
	}
});

test('chrome follows route theme and stays navigable', async ({ page }) => {
	await page.goto('/about');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'about');

	const blogLink = page.locator('.site-chrome__link', { hasText: 'Blog' });
	await expect(blogLink).toBeVisible();
	await blogLink.focus();
	await expect(blogLink).toBeFocused();

	await page.goto('/news');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'news');
	const newsLink = page.locator('.site-chrome__link[aria-current="page"]');
	await expect(newsLink).toContainText('News');
});
