import * as fs from 'fs/promises';
import * as path from 'path';

const CONTENT_PATH = path.join(process.cwd(), 'content', 'career');
const SNAPSHOT_FILE = 'content/career/builder.json';

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
	try {
		const filePath = path.join(CONTENT_PATH, 'builder.json');
		const content = await fs.readFile(filePath, 'utf-8');
		const parsed = JSON.parse(content) as unknown;
		return parseBuilderSnapshotFile(parsed);
	} catch (error: any) {
		if (error?.code === 'ENOENT') {
			console.warn(`Builder snapshot: ${SNAPSHOT_FILE} not found. Returning empty snapshot.`);
			return emptySnapshot;
		}
		if (error instanceof Error && error.message.startsWith('Builder snapshot:')) {
			throw error;
		}
		throw new Error(
			`Builder snapshot: Failed to load ${SNAPSHOT_FILE}. ${error instanceof Error ? error.message : String(error)}`
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
		const url = requireUrl(entry['url'], `data[${index}].url`);
		const publishedAtValue = entry['publishedAt'];
		let publishedAt: string | undefined;
		if (typeof publishedAtValue !== 'undefined') {
			publishedAt = requireIsoDate(publishedAtValue, `data[${index}].publishedAt`);
		}

		return {
			id,
			title,
			description,
			url,
			...(publishedAt ? { publishedAt } : {})
		};
	});

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

function requireUrl(value: unknown, label: string): string {
	if (typeof value !== 'string' || !value.trim()) {
		return fail(`Expected string URL in ${label}`);
	}
	try {
		const parsed = new URL(value);
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return fail(`Expected http(s) URL in ${label}`);
		}
	} catch {
		return fail(`Expected http(s) URL in ${label}`);
	}
	return value;
}

function fail(message: string): never {
	throw new Error(`Builder snapshot: ${message} (${SNAPSHOT_FILE})`);
}
