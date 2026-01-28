// @ts-nocheck
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	extractRssItems,
	extractSitemapUrls,
	extractBlogMetadata,
	normalizeCanonicalUrl
} from './scrape-builderio/core.mjs';

const DEFAULT_OUTPUT = 'content/career/builder.json';
const AUTHOR_ALLOWLIST = ['Alice Moore', 'Alice Alexandra Moore'];
const RSS_URL = 'https://www.builder.io/blog/rss.xml';
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
	skipped: 0,
	skipReasons: new Map()
};

try {
	const candidates = await getCandidateUrls();
	summary.urlsFound = candidates.length;

	const results = await mapWithConcurrency(candidates, args.concurrency, async (url) => {
		summary.postsFetched += 1;
		const html = await fetchText(url);
		const metadata = extractBlogMetadata(html);
		if (!metadata) {
			bumpSkip('missing metadata');
			return null;
		}

		summary.postsParsed += 1;
		if (!matchesAuthor(metadata.authorName, AUTHOR_ALLOWLIST)) {
			bumpSkip('author mismatch');
			return null;
		}

		const canonicalUrl = normalizeCanonicalUrl(metadata.canonicalUrl ?? url);
		if (!canonicalUrl) {
			bumpSkip('invalid canonical url');
			return null;
		}

		const post = normalizeBuilderPost(canonicalUrl, metadata);
		if (!post) {
			bumpSkip('invalid post data');
			return null;
		}

		summary.matches += 1;
		return post;
	});

	const data = dedupePosts(results.filter(Boolean));
	data.sort((a, b) => {
		const aDate = a.publishedAt ?? '';
		const bDate = b.publishedAt ?? '';
		if (aDate === bDate) {
			return a.title.localeCompare(b.title);
		}
		return aDate > bDate ? -1 : 1;
	});

	const previousSnapshot = await readPreviousSnapshot(outputPath);
	const generatedAt = new Date().toISOString();
	const dataUpdatedAt = hasSameData(previousSnapshot?.data, data)
		? previousSnapshot?.dataUpdatedAt ?? generatedAt
		: generatedAt;

	const payload = {
		version: 1,
		generatedAt,
		dataUpdatedAt,
		source: {
			site: 'builder.io',
			query: {
				authorAllowlist: AUTHOR_ALLOWLIST,
				section: 'blog'
			}
		},
		data
	};

	if (!args.dryRun) {
		await fs.mkdir(path.dirname(outputPath), { recursive: true });
		await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
	}

	console.log('Builder scraper: Done');
	console.log(
		`Builder scraper: URLs ${summary.urlsFound} | parsed ${summary.postsParsed} | matched ${summary.matches} | skipped ${summary.skipped}`
	);
	if (summary.skipReasons.size > 0) {
		console.log(
			`Builder scraper: Skip reasons - ${[...summary.skipReasons.entries()]
				.map(([reason, count]) => `${reason} (${count})`)
				.join(', ')}`
		);
	}
	if (args.dryRun) {
		console.log('Builder scraper: Dry run enabled; no file written.');
	}
} catch (error) {
	console.error(
		`Builder scraper: Fatal error - ${error instanceof Error ? error.message : String(error)}`
	);
	process.exit(1);
}

async function getCandidateUrls() {
	try {
		const rssXml = await fetchText(RSS_URL);
		const items = extractRssItems(rssXml);
		if (items.length > 0) {
			return [...new Set(items.map((item) => item.url))];
		}
	} catch (error) {
		console.warn(
			`Builder scraper: RSS fetch failed (${RSS_URL}) - ${error instanceof Error ? error.message : error}`
		);
	}

	const sitemapXml = await fetchText(SITEMAP_URL);
	return extractSitemapUrls(sitemapXml);
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
				bumpSkip('fetch error');
				console.warn(
					`Builder scraper: Failed to process ${items[currentIndex]} - ${error instanceof Error ? error.message : error}`
				);
			}
		}
	});

	await Promise.all(workers);
	return results;
}

function matchesAuthor(authorName, allowlist) {
	if (!authorName) return false;
	const normalized = authorName.toLowerCase();
	return allowlist.some((author) => normalized.includes(author.toLowerCase()));
}

function normalizeBuilderPost(url, metadata) {
	if (!metadata?.title || !metadata?.description) {
		return null;
	}

	const publishedAt = normalizeDate(metadata.publishedAt);
	return {
		id: url,
		title: metadata.title,
		description: metadata.description,
		url,
		...(publishedAt ? { publishedAt } : {})
	};
}

function normalizeDate(value) {
	if (!value) return null;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return null;
	return parsed.toISOString();
}

function dedupePosts(posts) {
	const seen = new Set();
	const output = [];
	for (const post of posts) {
		if (!post?.url || seen.has(post.url)) continue;
		seen.add(post.url);
		output.push(post);
	}
	return output;
}

async function readPreviousSnapshot(filePath) {
	try {
		const content = await fs.readFile(filePath, 'utf8');
		return JSON.parse(content);
	} catch (error) {
		if (error?.code === 'ENOENT') return null;
		console.warn(
			`Builder scraper: Failed reading previous snapshot ${filePath} - ${error instanceof Error ? error.message : error}`
		);
		return null;
	}
}

function hasSameData(previousData, nextData) {
	if (!Array.isArray(previousData)) return false;
	if (previousData.length !== nextData.length) return false;
	return JSON.stringify(previousData) === JSON.stringify(nextData);
}

function bumpSkip(reason) {
	summary.skipped += 1;
	summary.skipReasons.set(reason, (summary.skipReasons.get(reason) ?? 0) + 1);
}
