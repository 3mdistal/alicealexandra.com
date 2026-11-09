import { expect, test, type Locator, type Page } from '@playwright/test';
import path from 'node:path';

// CI's stub content has this post, with one interlude video between filler paragraphs (see
// .github/workflows/ci.yml). The test doesn't write it: the blog's sitemap and feed read every post,
// so a file appearing or vanishing mid-run would break other tests running alongside.
const slug = 'ci-interlude-video';
const videoFile = path.join(process.cwd(), 'tests', 'e2e', 'fixtures', 'interlude.webm');

test.beforeEach(async ({ request }) => {
	const post = await request.get(`/blog/${slug}`);
	test.skip(
		post.status() === 404,
		"Needs CI's stub content, which has the ci-interlude-video post"
	);
});

async function openPost(page: Page) {
	await page.route('**/e2e-fixtures/interlude.webm', (route) =>
		route.fulfill({ path: videoFile, contentType: 'video/webm' })
	);
	await page.goto(`/blog/${slug}`);

	const video = page.locator('.session-interlude-video');
	const button = page.locator('.session-interlude-toggle');
	await expect(button).toBeAttached();
	return { video, button };
}

const isPlaying = (video: Locator) =>
	video.evaluate((element: HTMLVideoElement) => !element.paused);

test('an interlude video plays on screen and stays paused once the reader pauses it', async ({
	page
}) => {
	const { video, button } = await openPost(page);

	await video.scrollIntoViewIfNeeded();
	await expect.poll(() => isPlaying(video)).toBe(true);
	await expect(button).toBeVisible();
	await expect(button).toHaveAccessibleName('Pause video');

	await button.click();
	await expect.poll(() => isPlaying(video)).toBe(false);
	await expect(button).toHaveAccessibleName('Play video');

	await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	await video.scrollIntoViewIfNeeded();
	await page.waitForTimeout(500);
	expect(await isPlaying(video)).toBe(false);

	await button.focus();
	await page.keyboard.press('Space');
	await expect.poll(() => isPlaying(video)).toBe(true);
	await expect(button).toHaveAccessibleName('Pause video');
});

test('an interlude video waits for the reader when they prefer reduced motion', async ({
	page
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	const { video, button } = await openPost(page);

	await video.scrollIntoViewIfNeeded();
	await expect(button).toBeVisible();
	await page.waitForTimeout(500);
	expect(await isPlaying(video)).toBe(false);
	await expect(button).toHaveAccessibleName('Play video');

	await button.click();
	await expect.poll(() => isPlaying(video)).toBe(true);
});
