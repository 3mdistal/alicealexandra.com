/**
 * Utilities for loading postcard content from local markdown files
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { type EditableMarkdownDocument } from '$lib/content/editable-source';
import { createContentSourceChecksum } from '$lib/content/editable-source.server';

// Use process.cwd() which works during SvelteKit build
const CONTENT_PATH = path.join(process.cwd(), 'content', 'postcards');
const POSTCARD_FRONTMATTER_FIELDS = [
	'title',
	'slug',
	'description',
	'heroImage',
	'lastEditedTime',
	'notionId'
] as const;

export interface PostcardMeta {
	id: string;
	slug: string;
	title: string;
	description: string;
	heroImage?: string;
	lastEditedTime: string;
}

export interface Postcard extends PostcardMeta {
	notionId: string;
	content: string;
}

export interface PostcardFrontmatter {
	title: string;
	slug: string;
	description: string;
	heroImage: string;
	lastEditedTime: string;
	notionId: string;
}

export type EditablePostcardDocument = EditableMarkdownDocument<PostcardFrontmatter>;

function createEmptyPostcardFrontmatter(): PostcardFrontmatter {
	return {
		title: '',
		slug: '',
		description: '',
		heroImage: '',
		lastEditedTime: '',
		notionId: ''
	};
}

export function normalizePostcardFrontmatter(
	frontmatter: Partial<PostcardFrontmatter>,
	slug: string
): PostcardFrontmatter {
	return {
		...createEmptyPostcardFrontmatter(),
		...frontmatter,
		slug
	};
}

export function normalizeHeroImage(value: unknown): string | undefined {
	if (typeof value !== 'string') return undefined;
	let trimmed = value.trim();
	if (!trimmed) return undefined;

	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		trimmed = trimmed.slice(1, -1).trim();
	}

	const match = trimmed.match(/https?:\/\/\S+/);
	if (!match) return undefined;

	let url = match[0].trim();
	const secondMatch = Array.from(url.matchAll(/https?:\/\//g));
	const nextUrlMatch = secondMatch[1];
	if (nextUrlMatch?.index !== undefined) {
		url = url.slice(0, nextUrlMatch.index);
	}

	if (!url) return undefined;
	if (/[\s'")]/.test(url)) return undefined;

	try {
		const parsed = new URL(url);
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
	} catch {
		return undefined;
	}

	return url;
}

function escapeYamlString(value: string): string {
	return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function parsePostcardMarkdown(content: string): {
	frontmatter: PostcardFrontmatter;
	body: string;
} {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/;
	const match = content.match(frontmatterRegex);

	if (!match || !match[1]) {
		throw new Error('No frontmatter found in markdown file');
	}

	const frontmatterStr = match[1];
	const body = content.slice(match[0].length);
	const frontmatter = createEmptyPostcardFrontmatter();
	for (const line of frontmatterStr.split('\n')) {
		const colonIndex = line.indexOf(':');
		if (colonIndex <= 0) {
			continue;
		}

		const key = line.slice(0, colonIndex).trim() as keyof PostcardFrontmatter;
		let value = line.slice(colonIndex + 1).trim();

		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
		}

		if (key in frontmatter) {
			frontmatter[key] = value;
		}
	}

	return {
		frontmatter,
		body: body.trim()
	};
}

export function serializePostcardMarkdown(frontmatter: PostcardFrontmatter, body: string): string {
	const normalizedBody = body.trim();
	const frontmatterLines = POSTCARD_FRONTMATTER_FIELDS.map(
		(field) => `${field}: "${escapeYamlString(frontmatter[field] ?? '')}"`
	);

	return `---\n${frontmatterLines.join('\n')}\n---\n\n${normalizedBody}\n`;
}

export async function loadRawPostcardMarkdownBySlug(
	slug: string
): Promise<EditablePostcardDocument | null> {
	const filePath = path.join(CONTENT_PATH, `${slug}.md`);
	try {
		const rawSource = await fs.readFile(filePath, 'utf-8');
		const { frontmatter, body } = parsePostcardMarkdown(rawSource);

		return {
			frontmatter,
			content: body,
			rawSource,
			checksum: createContentSourceChecksum(rawSource)
		};
	} catch (err: any) {
		if (err?.code === 'ENOENT') return null;
		const message = err instanceof Error ? err.message : String(err);
		throw new Error(`Failed to load postcard "${slug}" from ${filePath}: ${message}`, { cause: err });
	}
}

/**
 * Load all postcards metadata from metadata.json (for listing page)
 */
export async function loadPostcardsMeta(): Promise<PostcardMeta[]> {
	const metadataPath = path.join(CONTENT_PATH, 'metadata.json');
	try {
		const content = await fs.readFile(metadataPath, 'utf-8');
		const metadata = JSON.parse(content) as PostcardMeta[];
		return metadata.map((postcard) => {
			const heroImage = normalizeHeroImage(postcard.heroImage);
			if (!heroImage) {
				const { heroImage: _heroImage, ...rest } = postcard;
				return rest;
			}
			return { ...postcard, heroImage };
		});
	} catch (err: any) {
		// If the postcards folder hasn't been added to teenylilcontent yet, don't fail the build.
		// This keeps the /studio/postcards page working (it will show the empty state).
		if (err?.code === 'ENOENT') return [];
		throw err;
	}
}

/**
 * Load a single postcard by slug (for detail page)
 */
export async function loadPostcardBySlug(slug: string): Promise<Postcard | null> {
	try {
		const editablePostcard = await loadRawPostcardMarkdownBySlug(slug);
		if (!editablePostcard) {
			return null;
		}

		const { frontmatter, content } = editablePostcard;
		const heroImage = normalizeHeroImage(frontmatter.heroImage);
		const base: Postcard = {
			id: frontmatter.notionId,
			notionId: frontmatter.notionId,
			slug: frontmatter.slug,
			title: frontmatter.title,
			description: frontmatter.description,
			lastEditedTime: frontmatter.lastEditedTime,
			content
		};

		return heroImage ? { ...base, heroImage } : base;
	} catch (err: any) {
		if (err?.code === 'ENOENT') return null;
		const message = err instanceof Error ? err.message : String(err);
		throw new Error(`Failed to load postcard "${slug}" from ${path.join(CONTENT_PATH, `${slug}.md`)}: ${message}`, { cause: err });
	}
}
