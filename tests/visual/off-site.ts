import type { Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CACHE = fileURLToPath(new URL('./__cache__/', import.meta.url));

/**
 * Answers every off-site request, and every request to Vercel's image optimizer (which
 * `vite preview` doesn't run), from a disk cache filled on first use, so a slow or failed download
 * can't show up as a pixel difference. Images are swapped for flat gray ones of the same
 * size: Chromium doesn't rasterize photos identically from run to run, and design changes never
 * touch their pixels, but their size still shapes the layout.
 */
export async function serveOffSiteFromCache(page: Page) {
	mkdirSync(CACHE, { recursive: true });
	const isOffSite = (url: URL) => url.hostname !== '127.0.0.1' || url.pathname === '/_vercel/image';
	await page.route(isOffSite, async (route) => {
		const requested = new URL(route.request().url());
		const url =
			requested.pathname === '/_vercel/image'
				? (requested.searchParams.get('url') ?? requested.href)
				: requested.href;
		const file = CACHE + createHash('sha256').update(url).digest('hex');
		if (!existsSync(file)) {
			const response = await fetchWithRetries(() => route.fetch({ url }));
			if (!response) return route.abort();
			// The body comes back decoded, so drop the headers that describe the encoded one.
			const headers = Object.fromEntries(
				Object.entries(response.headers()).filter(
					([name]) => !['content-encoding', 'content-length', 'transfer-encoding'].includes(name)
				)
			);
			// Write to unique temporary names and rename, since parallel workers may fetch the same URL.
			const temporary = `${file}.${process.pid}.${Math.random()}`;
			writeFileSync(`${temporary}.json`, JSON.stringify({ status: response.status(), headers }));
			writeFileSync(temporary, await response.body());
			renameSync(`${temporary}.json`, `${file}.json`);
			renameSync(temporary, file);
		}

		const { status, headers } = JSON.parse(readFileSync(`${file}.json`, 'utf8')) as {
			status: number;
			headers: Record<string, string>;
		};
		const body = readFileSync(file);
		const size = imageSize(body);
		if (!size) return route.fulfill({ status, headers, body });
		await route.fulfill({
			status,
			contentType: 'image/svg+xml',
			body: `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}"><rect width="100%" height="100%" fill="#888"/></svg>`
		});
	});
}

/** Retries network errors and server errors; a 404 is an answer, and gets cached like any other. */
async function fetchWithRetries<T extends { status(): number }>(fetch: () => Promise<T>) {
	let response: T | undefined;
	for (let attempt = 0; attempt < 3; attempt += 1) {
		response = await fetch().catch(() => undefined);
		if (response && response.status() < 500) return response;
	}
	return response;
}

/** Reads the pixel size from a JPEG, PNG, GIF or WebP header, or returns undefined for anything else. */
export function imageSize(data: Buffer): { width: number; height: number } | undefined {
	if (data.length < 30) return undefined;

	if (data.readUInt32BE(0) === 0x89504e47) {
		return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
	}

	if (data.toString('latin1', 0, 4) === 'GIF8') {
		return { width: data.readUInt16LE(6), height: data.readUInt16LE(8) };
	}

	if (data.toString('latin1', 0, 4) === 'RIFF' && data.toString('latin1', 8, 12) === 'WEBP') {
		const chunk = data.toString('latin1', 12, 16);
		if (chunk === 'VP8 ') {
			return { width: data.readUInt16LE(26) & 0x3fff, height: data.readUInt16LE(28) & 0x3fff };
		}
		if (chunk === 'VP8L') {
			const bits = data.readUInt32LE(21);
			return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
		}
		if (chunk === 'VP8X') {
			return { width: data.readUIntLE(24, 3) + 1, height: data.readUIntLE(27, 3) + 1 };
		}
		return undefined;
	}

	if (data[0] === 0xff && data[1] === 0xd8) {
		// Walk the JPEG segments to the start-of-frame marker, which holds the size.
		let offset = 2;
		while (offset + 9 < data.length && data[offset] === 0xff) {
			const marker = data[offset + 1] ?? 0;
			const isStartOfFrame =
				marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
			if (isStartOfFrame) {
				return { width: data.readUInt16BE(offset + 7), height: data.readUInt16BE(offset + 5) };
			}
			offset += 2 + data.readUInt16BE(offset + 2);
		}
	}

	return undefined;
}
