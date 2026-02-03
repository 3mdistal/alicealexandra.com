/**
 * Utilities for loading postcard content from local markdown files
 */

import * as fs from 'fs/promises';
import * as path from 'path';

// Use process.cwd() which works during SvelteKit build
const CONTENT_PATH = path.join(process.cwd(), 'content', 'postcards');

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

interface PostcardFrontmatter {
	title: string;
	slug: string;
	description: string;
	heroImage: string;
	lastEditedTime: string;
	notionId: string;
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

function parseFrontmatter(content: string): { frontmatter: PostcardFrontmatter; body: string } {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
	const match = content.match(frontmatterRegex);

	if (!match || !match[1]) {
		throw new Error('No frontmatter found in markdown file');
	}

	const frontmatterStr: string = match[1];
	const body = content.slice(match[0].length);

	const frontmatter: Record<string, any> = {};
	for (const line of frontmatterStr.split('\n')) {
		const colonIndex = line.indexOf(':');
		if (colonIndex > 0) {
			const key = line.slice(0, colonIndex).trim();
			let value: any = line.slice(colonIndex + 1).trim();

			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
			} else if (value === 'true') value = true;
			else if (value === 'false') value = false;
			else if (!isNaN(Number(value))) value = Number(value);

			frontmatter[key] = value;
		}
	}

	return {
		frontmatter: frontmatter as PostcardFrontmatter,
		body: body.trim()
	};
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
	const filePath = path.join(CONTENT_PATH, `${slug}.md`);
	try {
		const fileContent = await fs.readFile(filePath, 'utf-8');
		const { frontmatter, body } = parseFrontmatter(fileContent);
		const heroImage = normalizeHeroImage(frontmatter.heroImage);

		const base: Postcard = {
			id: frontmatter.notionId,
			notionId: frontmatter.notionId,
			slug: frontmatter.slug,
			title: frontmatter.title,
			description: frontmatter.description,
			lastEditedTime: frontmatter.lastEditedTime,
			content: body
		};

		return heroImage ? { ...base, heroImage } : base;
	} catch (err: any) {
		if (err?.code === 'ENOENT') return null;
		const message = err instanceof Error ? err.message : String(err);
		throw new Error(`Failed to load postcard "${slug}" from ${filePath}: ${message}`);
	}
}
