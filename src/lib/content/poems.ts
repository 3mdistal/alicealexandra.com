/**
 * Utilities for loading poem content from local markdown files
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { type EditableMarkdownDocument } from '$lib/content/editable-source';
import { createContentSourceChecksum } from '$lib/content/editable-source.server';

// Use process.cwd() which works during SvelteKit build
// This points to project root during both local dev and Vercel build
const CONTENT_PATH = path.join(process.cwd(), 'content', 'poems');
const POEM_FRONTMATTER_FIELDS = ['title', 'section', 'sequence', 'notLineated', 'notionId'] as const;

export interface Section {
	id: string;
	name: string;
	quote: string;
	quoteAuthor: string;
	act: string;
	coverImage: string;
	secondaryImage: string;
	sequence: number;
}

export interface PoemMeta {
	id: string; // Derived from filename (slug)
	title: string;
	sectionName: string;
	notLineated: boolean;
	sequence: number;
}

export interface Poem extends PoemMeta {
	content: string;
}

export interface PoemFrontmatter {
	title: string;
	section: string;
	sequence: number;
	notLineated: boolean;
	notionId: string;
}

export type EditablePoemDocument = EditableMarkdownDocument<PoemFrontmatter>;

function createEmptyPoemFrontmatter(): PoemFrontmatter {
	return {
		title: '',
		section: '',
		sequence: 1,
		notLineated: false,
		notionId: ''
	};
}

export function normalizePoemFrontmatter(frontmatter: Partial<PoemFrontmatter>): PoemFrontmatter {
	return {
		...createEmptyPoemFrontmatter(),
		...frontmatter,
		sequence:
			typeof frontmatter.sequence === 'number' && Number.isFinite(frontmatter.sequence)
				? frontmatter.sequence
				: createEmptyPoemFrontmatter().sequence,
		notLineated: frontmatter.notLineated === true
	};
}

/**
 * Parse frontmatter from markdown content
 */
export function parsePoemMarkdown(content: string): { frontmatter: PoemFrontmatter; body: string } {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/;
	const match = content.match(frontmatterRegex);

	if (!match || !match[1]) {
		throw new Error('No frontmatter found in markdown file');
	}

	const frontmatterStr: string = match[1];
	const body = content.slice(match[0].length);
	const frontmatter = createEmptyPoemFrontmatter();

	for (const line of frontmatterStr.split('\n')) {
		const colonIndex = line.indexOf(':');
		if (colonIndex <= 0) {
			continue;
		}

		const key = line.slice(0, colonIndex).trim() as keyof PoemFrontmatter;
		let value: string | number | boolean = line.slice(colonIndex + 1).trim();

		if (
			(typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) ||
			(typeof value === 'string' && value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
		} else if (value === 'true') {
			value = true;
		} else if (value === 'false') {
			value = false;
		} else if (!Number.isNaN(Number(value))) {
			value = Number(value);
		}

		if (key in frontmatter) {
			if (key === 'sequence') {
				frontmatter.sequence = Number(value) || 1;
				continue;
			}

			if (key === 'notLineated') {
				frontmatter.notLineated = value === true;
				continue;
			}

			frontmatter[key] = String(value);
		}
	}

	return {
		frontmatter,
		body: body.trim()
	};
}

export function serializePoemMarkdown(frontmatter: PoemFrontmatter, body: string): string {
	const normalizedFrontmatter = normalizePoemFrontmatter(frontmatter);
	const normalizedBody = body.trim();
	const frontmatterValues: Record<(typeof POEM_FRONTMATTER_FIELDS)[number], string> = {
		title: `"${normalizedFrontmatter.title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`,
		section: `"${normalizedFrontmatter.section.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`,
		sequence: String(normalizedFrontmatter.sequence),
		notLineated: normalizedFrontmatter.notLineated ? 'true' : 'false',
		notionId: `"${normalizedFrontmatter.notionId.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
	};
	const frontmatterLines = POEM_FRONTMATTER_FIELDS.filter(
		(field) => field !== 'notionId' || normalizedFrontmatter.notionId.trim()
	).map((field) => `${field}: ${frontmatterValues[field]}`);

	return `---\n${frontmatterLines.join('\n')}\n---\n\n${normalizedBody}\n`;
}

export async function loadRawPoemMarkdownBySlug(slug: string): Promise<EditablePoemDocument | null> {
	try {
		const filePath = path.join(CONTENT_PATH, `${slug}.md`);
		const rawSource = await fs.readFile(filePath, 'utf-8');
		const { frontmatter, body } = parsePoemMarkdown(rawSource);

		return {
			frontmatter,
			content: body,
			rawSource,
			checksum: createContentSourceChecksum(rawSource)
		};
	} catch {
		return null;
	}
}

/**
 * Load all sections from sections.json
 */
export async function loadSections(): Promise<Section[]> {
	const sectionsPath = path.join(CONTENT_PATH, 'sections.json');
	const content = await fs.readFile(sectionsPath, 'utf-8');
	return JSON.parse(content);
}

/**
 * Load all poems metadata (without content)
 */
export async function loadPoemsMeta(): Promise<PoemMeta[]> {
	const files = await fs.readdir(CONTENT_PATH);
	const mdFiles = files.filter((f) => f.endsWith('.md'));

	const poems: PoemMeta[] = [];

	for (const file of mdFiles) {
		const filePath = path.join(CONTENT_PATH, file);
		const content = await fs.readFile(filePath, 'utf-8');
		const { frontmatter } = parsePoemMarkdown(content);

		// Use filename (without .md) as the unique ID
		const slug = file.replace(/\.md$/, '');

		poems.push({
			id: slug,
			title: frontmatter.title,
			sectionName: frontmatter.section,
			notLineated: frontmatter.notLineated,
			sequence: frontmatter.sequence
		});
	}

	// Sort by sequence
	return poems.sort((a, b) => a.sequence - b.sequence);
}

/**
 * Load a single poem by its slug (filename without .md extension)
 */
export async function loadPoemContent(slug: string): Promise<string> {
	const filePath = path.join(CONTENT_PATH, `${slug}.md`);

	try {
		const content = await fs.readFile(filePath, 'utf-8');
		const { body } = parsePoemMarkdown(content);
		return body;
	} catch {
		throw new Error(`Poem with slug "${slug}" not found`);
	}
}

/**
 * Load a single poem by its slug (filename without .md extension)
 */
export async function loadPoemBySlug(slug: string): Promise<Poem | null> {
	try {
		const filePath = path.join(CONTENT_PATH, `${slug}.md`);
		const fileContent = await fs.readFile(filePath, 'utf-8');
		const { frontmatter, body } = parsePoemMarkdown(fileContent);

		return {
			id: slug,
			title: frontmatter.title,
			sectionName: frontmatter.section,
			notLineated: frontmatter.notLineated,
			sequence: frontmatter.sequence,
			content: body
		};
	} catch {
		return null;
	}
}

/**
 * Load all poems with their content
 */
export async function loadAllPoems(): Promise<Poem[]> {
	const files = await fs.readdir(CONTENT_PATH);
	const mdFiles = files.filter((f) => f.endsWith('.md'));

	const poems: Poem[] = [];

	for (const file of mdFiles) {
		const filePath = path.join(CONTENT_PATH, file);
		const fileContent = await fs.readFile(filePath, 'utf-8');
		const { frontmatter, body } = parsePoemMarkdown(fileContent);

		// Use filename (without .md) as the unique ID
		const slug = file.replace(/\.md$/, '');

		poems.push({
			id: slug,
			title: frontmatter.title,
			sectionName: frontmatter.section,
			notLineated: frontmatter.notLineated,
			sequence: frontmatter.sequence,
			content: body
		});
	}

	// Sort by sequence
	return poems.sort((a, b) => a.sequence - b.sequence);
}

/**
 * Create a rich text item with all required fields
 */
function createRichTextItem(content: string) {
	return {
		type: 'text' as const,
		plain_text: content,
		text: { content, link: null },
		annotations: {
			bold: false,
			italic: false,
			strikethrough: false,
			underline: false,
			code: false,
			color: 'default' as const
		},
		href: null
	};
}

/**
 * Transform sections to match the Notion API response format
 * (for compatibility with existing page component)
 */
export function transformSectionsToNotionFormat(sections: Section[]) {
	return {
		results: sections.map((section) => ({
			id: section.id,
			cover: section.coverImage
				? {
						type: 'external' as const,
						external: { url: section.coverImage }
					}
				: null,
			properties: {
				Name: {
					type: 'title' as const,
					title: [{ plain_text: section.name }]
				},
				Quote: {
					type: 'rich_text' as const,
					rich_text: [createRichTextItem(section.quote)]
				},
				QuoteAuthor: {
					type: 'rich_text' as const,
					rich_text: [createRichTextItem(section.quoteAuthor)]
				},
				Act: {
					type: 'rich_text' as const,
					rich_text: [createRichTextItem(section.act)]
				},
				secondaryImage: {
					type: 'url' as const,
					url: section.secondaryImage
				}
			}
		}))
	};
}

/**
 * Transform poems to match the Notion API response format
 * (for compatibility with existing page component)
 */
export function transformPoemsToNotionFormat(poems: PoemMeta[]) {
	return {
		results: poems.map((poem) => ({
			id: poem.id,
			properties: {
				Name: {
					type: 'title' as const,
					title: [{ plain_text: poem.title }]
				},
				sectionName: {
					type: 'formula' as const,
					formula: { string: poem.sectionName }
				},
				NotLineated: {
					type: 'checkbox' as const,
					checkbox: poem.notLineated
				}
			}
		}))
	};
}
