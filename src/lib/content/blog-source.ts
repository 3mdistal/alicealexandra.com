import fs from 'node:fs/promises';
import * as path from 'node:path';
import { createHash } from 'node:crypto';

const BLOG_CONTENT_PATH = path.join(process.cwd(), 'content', 'blog');
const BLOG_READING_SPEED_WORDS_PER_MINUTE = 225;

const BLOG_FRONTMATTER_FIELDS = [
	'title',
	'slug',
	'subtitle',
	'summary',
	'ogDescription',
	'category',
	'publicationDate',
	'formattedPublicationDate',
	'coverImage',
	'coverImageCaption',
	'notionId'
] as const;

export interface BlogFrontmatter {
	title: string;
	slug: string;
	subtitle: string;
	summary: string;
	ogDescription: string;
	category: string;
	publicationDate: string;
	formattedPublicationDate: string;
	coverImage: string;
	coverImageCaption: string;
	notionId: string;
}

export interface EditableBlogDocument {
	frontmatter: BlogFrontmatter;
	content: string;
	rawSource: string;
	checksum: string;
}

export function isValidBlogSlug(slug: string): boolean {
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function createEmptyBlogFrontmatter(): BlogFrontmatter {
	return {
		title: '',
		slug: '',
		subtitle: '',
		summary: '',
		ogDescription: '',
		category: '',
		publicationDate: '',
		formattedPublicationDate: '',
		coverImage: '',
		coverImageCaption: '',
		notionId: ''
	};
}

export function normalizeBlogFrontmatter(
	frontmatter: Partial<BlogFrontmatter>,
	slug: string
): BlogFrontmatter {
	return {
		...createEmptyBlogFrontmatter(),
		...frontmatter,
		slug
	};
}

export function parseBlogMarkdown(content: string): { frontmatter: BlogFrontmatter; body: string } {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/;
	const match = content.match(frontmatterRegex);

	if (!match || !match[1]) {
		throw new Error('No frontmatter found in markdown file');
	}

	const frontmatterStr = match[1];
	const body = content.slice(match[0].length);
	const frontmatter = createEmptyBlogFrontmatter();

	for (const line of frontmatterStr.split('\n')) {
		const colonIndex = line.indexOf(':');
		if (colonIndex <= 0) {
			continue;
		}

		const key = line.slice(0, colonIndex).trim() as keyof BlogFrontmatter;
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

function escapeYamlString(value: string): string {
	return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function serializeBlogMarkdown(frontmatter: BlogFrontmatter, body: string): string {
	const normalizedBody = body.trim();
	const frontmatterLines = BLOG_FRONTMATTER_FIELDS.map(
		(field) => `${field}: "${escapeYamlString(frontmatter[field] ?? '')}"`
	);

	return `---\n${frontmatterLines.join('\n')}\n---\n\n${normalizedBody}\n`;
}

export function calculateBlogReadTimeFromContent(content: string): string {
	const wordCount = content.match(/\b[\w'-]+\b/g)?.length ?? 0;
	const minutes = Math.max(1, Math.ceil(wordCount / BLOG_READING_SPEED_WORDS_PER_MINUTE));
	return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

export function createBlogSourceChecksum(source: string): string {
	return createHash('sha1').update(source).digest('hex');
}

export async function loadRawBlogMarkdownBySlug(slug: string): Promise<EditableBlogDocument | null> {
	if (!isValidBlogSlug(slug)) {
		return null;
	}

	try {
		const filePath = path.join(BLOG_CONTENT_PATH, `${slug}.md`);
		const rawSource = await fs.readFile(filePath, 'utf-8');
		const { frontmatter, body } = parseBlogMarkdown(rawSource);

		return {
			frontmatter,
			content: body,
			rawSource,
			checksum: createBlogSourceChecksum(rawSource)
		};
	} catch {
		return null;
	}
}
