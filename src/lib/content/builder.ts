import * as fs from 'fs/promises';
import * as path from 'path';

const SNAPSHOT_FILE = 'data-snapshots/career/builder-posts.json';
const SNAPSHOT_PATH = path.join(process.cwd(), 'data-snapshots', 'career', 'builder-posts.json');

export interface BuilderPost {
	id: string;
	title: string;
	description: string;
	url: string;
	publishedAt?: string;
}

export interface BuilderSnapshot {
	version: number;
	generatedAt: string;
	dataUpdatedAt: string;
	source: {
		site: 'builder.io';
		query: {
			authorAllowlist: string[];
			section: 'blog';
		};
	};
	data: BuilderPost[];
}

const emptySnapshot: BuilderSnapshot = {
	version: 1,
	generatedAt: '',
	dataUpdatedAt: '',
	source: {
		site: 'builder.io',
		query: {
			authorAllowlist: [],
			section: 'blog'
		}
	},
	data: []
};

export async function loadBuilderSnapshot(): Promise<BuilderSnapshot> {
	const isCi = Boolean(process.env.CI || process.env.VERCEL);
	try {
		const content = await fs.readFile(SNAPSHOT_PATH, 'utf-8');
		const parsed = JSON.parse(content) as unknown;
		const snapshot = parseBuilderSnapshotFile(parsed);
		if (snapshot.data.length === 0) {
			return handleSnapshotFailure(isCi, 'Snapshot contains no posts');
		}
		return snapshot;
	} catch (error: any) {
		if (error?.code === 'ENOENT') {
			return handleSnapshotFailure(isCi, `${SNAPSHOT_FILE} not found`);
		}
		return handleSnapshotFailure(
			isCi,
			error instanceof Error ? error.message : 'Unknown error while loading snapshot'
		);
	}
}

export function parseBuilderSnapshotFile(value: unknown): BuilderSnapshot {
	if (!isRecord(value)) {
		return fail('Expected top-level object');
	}

	const version = value['version'];
	if (typeof version !== 'number' || version !== 1) {
		return fail('Expected version 1');
	}

	const generatedAt = requireIsoDate(value['generatedAt'], 'generatedAt');
	const dataUpdatedAt = requireIsoDate(value['dataUpdatedAt'], 'dataUpdatedAt');

	const source = value['source'];
	if (!isRecord(source)) {
		return fail('Expected source object');
	}

	if (source['site'] !== 'builder.io') {
		return fail('Expected source.site to be "builder.io"');
	}

	const query = source['query'];
	if (!isRecord(query)) {
		return fail('Expected source.query object');
	}

	if (query['section'] !== 'blog') {
		return fail('Expected source.query.section to be "blog"');
	}

	if (!Array.isArray(query['authorAllowlist'])) {
		return fail('Expected source.query.authorAllowlist array');
	}

	const authorAllowlist = query['authorAllowlist'].map((entry: unknown, index: number) => {
		if (typeof entry !== 'string' || !entry.trim()) {
			return fail(`Expected non-empty string in source.query.authorAllowlist[${index}]`);
		}
		return entry;
	});

	if (!Array.isArray(value['data'])) {
		return fail('Expected data array');
	}

	const data = value['data'].map((entry: unknown, index: number) => {
		if (!isRecord(entry)) {
			return fail(`Expected object in data[${index}]`);
		}

		const id = requireNonEmptyString(entry['id'], `data[${index}].id`);
		const title = requireNonEmptyString(entry['title'], `data[${index}].title`);
		const description = requireNonEmptyString(entry['description'], `data[${index}].description`);
		const url = requireBuilderBlogUrl(entry['url'], `data[${index}].url`);
		const publishedAtValue = entry['publishedAt'];
		let publishedAt: string | undefined;
		if (typeof publishedAtValue !== 'undefined') {
			publishedAt = requireDateOnly(publishedAtValue, `data[${index}].publishedAt`);
		}

		return {
			id,
			title,
			description,
			url,
			...(publishedAt ? { publishedAt } : {})
		};
	});

	assertUniqueUrls(data);
	assertSortedByDate(data);

	return {
		version,
		generatedAt,
		dataUpdatedAt,
		source: {
			site: 'builder.io',
			query: {
				authorAllowlist,
				section: 'blog'
			}
		},
		data
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requireNonEmptyString(value: unknown, label: string): string {
	if (typeof value !== 'string' || !value.trim()) {
		return fail(`Expected non-empty string in ${label}`);
	}
	return value;
}

function requireIsoDate(value: unknown, label: string): string {
	if (typeof value !== 'string' || !value.trim()) {
		return fail(`Expected ISO timestamp string in ${label}`);
	}
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return fail(`Expected ISO timestamp string in ${label}`);
	}
	return value;
}

function requireDateOnly(value: unknown, label: string): string {
	if (typeof value !== 'string' || !value.trim()) {
		return fail(`Expected YYYY-MM-DD string in ${label}`);
	}
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return fail(`Expected YYYY-MM-DD string in ${label}`);
	}
	return value;
}

function requireBuilderBlogUrl(value: unknown, label: string): string {
	if (typeof value !== 'string' || !value.trim()) {
		return fail(`Expected string URL in ${label}`);
	}
	try {
		const parsed = new URL(value);
		if (parsed.protocol !== 'https:') {
			return fail(`Expected https URL in ${label}`);
		}
		if (!['www.builder.io', 'builder.io'].includes(parsed.hostname)) {
			return fail(`Expected builder.io URL in ${label}`);
		}
		if (!parsed.pathname.startsWith('/blog/')) {
			return fail(`Expected /blog URL in ${label}`);
		}
	} catch {
		return fail(`Expected https builder.io/blog URL in ${label}`);
	}
	return value;
}

function fail(message: string): never {
	throw new Error(message);
}

function assertUniqueUrls(data: BuilderPost[]) {
	const seen = new Set<string>();
	for (const post of data) {
		if (seen.has(post.url)) {
			return fail(`Duplicate url detected: ${post.url}`);
		}
		seen.add(post.url);
	}
}

function assertSortedByDate(data: BuilderPost[]) {
	for (let index = 1; index < data.length; index += 1) {
		const prev = data[index - 1];
		const next = data[index];
		if (!prev || !next) continue;
		if (comparePosts(prev, next) > 0) {
			return fail('Expected data sorted by publishedAt descending with undated posts last');
		}
	}
}

function comparePosts(a: BuilderPost, b: BuilderPost): number {
	const aDate = a.publishedAt ?? '';
	const bDate = b.publishedAt ?? '';
	if (!aDate && !bDate) return 0;
	if (!aDate) return 1;
	if (!bDate) return -1;
	if (aDate === bDate) return 0;
	return aDate > bDate ? -1 : 1;
}

function handleSnapshotFailure(isCi: boolean, reason: string): BuilderSnapshot {
	if (isCi) {
		throw new Error('Builder snapshot missing/invalid. Run script to regenerate.');
	}
	console.warn(
		`Builder snapshot invalid: ${reason}. Run \`node scripts/scrape-builderio.mjs\``
	);
	return emptySnapshot;
}
