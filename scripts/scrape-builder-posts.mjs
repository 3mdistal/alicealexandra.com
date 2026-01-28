// @ts-nocheck
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	extractBlogUrlsFromSitemap,
	extractJsonLdObjects,
	normalizeBuilderPost,
	pickBlogMetadata
} from './builder-scrape-core.mjs';

const DEFAULT_OUTPUT = 'src/lib/content/data/builder-posts.json';
const AUTHOR_FILTER = 'Alice Moore';
const SITEMAP_URL = 'https://www.builder.io/sitemap.xml';

const args = parseArgs(process.argv.slice(2));
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const outputPath = path.resolve(repoRoot, args.out ?? DEFAULT_OUTPUT);

const summary = {
	urlsFound: 0,
	postsFetched: 0,
	postsParsed: 0,
	matches: 0,
	skipped: 0
};

try {
	const sitemapXml = await fetchText(SITEMAP_URL);
	const blogUrls = extractBlogUrlsFromSitemap(sitemapXml);
	summary.urlsFound = blogUrls.length;

	const results = await mapWithConcurrency(blogUrls, args.concurrency, async (url) => {
		summary.postsFetched += 1;
		const html = await fetchText(url);
		const jsonLd = extractJsonLdObjects(html);
		const meta = pickBlogMetadata(jsonLd);
		if (!meta) {
			summary.skipped += 1;
			console.warn(`[builder-scrape] No JSON-LD metadata found for ${url}`);
			return null;
		}

		summary.postsParsed += 1;
		if (!matchesAuthor(meta.authorName, AUTHOR_FILTER)) {
			summary.skipped += 1;
			return null;
		}

		const post = normalizeBuilderPost(url, meta);
		if (!post) {
			summary.skipped += 1;
			console.warn(`[builder-scrape] Skipping invalid post data for ${url}`);
			return null;
		}

		summary.matches += 1;
		return post;
	});

	const data = results.filter(Boolean);
	data.sort((a, b) => {
		if (a.datePublished === b.datePublished) {
			return a.id.localeCompare(b.id);
		}
		return a.datePublished > b.datePublished ? -1 : 1;
	});

	const payload = {
		schemaVersion: 1,
		generatedFrom: SITEMAP_URL,
		authorFilter: AUTHOR_FILTER,
		data
	};

	if (!args.dryRun) {
		await fs.mkdir(path.dirname(outputPath), { recursive: true });
		await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
	}

	console.log('[builder-scrape] Done');
	console.log(
		`[builder-scrape] URLs: ${summary.urlsFound} | parsed: ${summary.postsParsed} | matched: ${summary.matches} | skipped: ${summary.skipped}`
	);
	if (args.dryRun) {
		console.log('[builder-scrape] Dry run enabled; no file written.');
	}
} catch (error) {
	console.error('[builder-scrape] Fatal error:', error instanceof Error ? error.message : error);
	process.exit(1);
}

function parseArgs(cliArgs) {
	const options = {
		out: DEFAULT_OUTPUT,
		concurrency: 6,
		dryRun: false
	};

	for (let i = 0; i < cliArgs.length; i += 1) {
		const arg = cliArgs[i];
		if (arg === '--out') {
			options.out = cliArgs[i + 1];
			i += 1;
		} else if (arg === '--concurrency') {
			const value = Number(cliArgs[i + 1]);
			if (!Number.isNaN(value) && value > 0) {
				options.concurrency = value;
			}
			i += 1;
		} else if (arg === '--dry-run') {
			options.dryRun = true;
		}
	}

	return options;
}

async function fetchText(url) {
	const response = await fetchWithRetry(url, 3);
	if (!response.ok) {
		throw new Error(`Request failed: ${response.status} ${response.statusText}`);
	}
	return response.text();
}

async function fetchWithRetry(url, attempts) {
	let lastError;
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		try {
			const response = await fetch(url, {
				headers: {
					'User-Agent': 'alicealexandra.com builder-scrape'
				}
			});
			return response;
		} catch (error) {
			lastError = error;
			await delay(300 * Math.pow(2, attempt));
		}
	}
	throw lastError;
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mapWithConcurrency(items, concurrency, handler) {
	const results = new Array(items.length);
	let index = 0;

	const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
		while (index < items.length) {
			const currentIndex = index;
			index += 1;
			try {
				results[currentIndex] = await handler(items[currentIndex]);
			} catch (error) {
				results[currentIndex] = null;
				summary.skipped += 1;
				console.warn(
					`[builder-scrape] Failed to process ${items[currentIndex]}: ${error instanceof Error ? error.message : error}`
				);
			}
		}
	});

	await Promise.all(workers);
	return results;
}

function matchesAuthor(authorName, expected) {
	if (!authorName) {
		return false;
	}
	return authorName.toLowerCase().includes(expected.toLowerCase());
}
