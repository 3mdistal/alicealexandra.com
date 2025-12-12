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

			if (value.startsWith('"') && value.endsWith('"')) {
				value = value.slice(1, -1).replace(/\\"/g, '"');
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
	const content = await fs.readFile(metadataPath, 'utf-8');
	return JSON.parse(content);
}

/**
 * Load a single postcard by slug (for detail page)
 */
export async function loadPostcardBySlug(slug: string): Promise<Postcard | null> {
	try {
		const filePath = path.join(CONTENT_PATH, `${slug}.md`);
		const fileContent = await fs.readFile(filePath, 'utf-8');
		const { frontmatter, body } = parseFrontmatter(fileContent);

		const base: Postcard = {
			id: frontmatter.notionId,
			notionId: frontmatter.notionId,
			slug: frontmatter.slug,
			title: frontmatter.title,
			description: frontmatter.description,
			lastEditedTime: frontmatter.lastEditedTime,
			content: body
		};

		return frontmatter.heroImage ? { ...base, heroImage: frontmatter.heroImage } : base;
	} catch {
		return null;
	}
}
