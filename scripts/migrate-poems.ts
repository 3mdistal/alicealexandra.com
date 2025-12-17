/**
 * Migration script: Fetch poems from Notion and convert to local markdown files
 *
 * Usage: npx tsx scripts/migrate-poems.ts
 *
 * Requires environment variables:
 *   - NOTION_KEY: Notion API integration token
 *   - POEMS_SECTIONS_DB: Database ID for poem sections
 *   - ALL_SCRAPS_DB: Database ID for individual poems
 */

import { Client } from '@notionhq/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
// Use --local flag to write to local content folder (for development)
const isLocal = process.argv.includes('--local');
const CONTENT_REPO_PATH = isLocal
	? path.resolve(__dirname, '../content/poems')
	: path.resolve(__dirname, '../../teenylilcontent/poems');

// Environment variables
const NOTION_KEY = process.env.NOTION_KEY;
const POEMS_SECTIONS_DB = process.env.POEMS_SECTIONS_DB;
const ALL_SCRAPS_DB = process.env.ALL_SCRAPS_DB;

if (!NOTION_KEY || !POEMS_SECTIONS_DB || !ALL_SCRAPS_DB) {
	console.error('Missing required environment variables:');
	if (!NOTION_KEY) console.error('  - NOTION_KEY');
	if (!POEMS_SECTIONS_DB) console.error('  - POEMS_SECTIONS_DB');
	if (!ALL_SCRAPS_DB) console.error('  - ALL_SCRAPS_DB');
	process.exit(1);
}

const notion = new Client({
	auth: NOTION_KEY,
	notionVersion: '2025-09-03'
});

// Types
interface Section {
	id: string;
	name: string;
	quote: string;
	quoteAuthor: string;
	act: string;
	coverImage: string;
	secondaryImage: string;
	sequence: number;
}

interface Poem {
	id: string;
	title: string;
	sectionName: string;
	notLineated: boolean;
	sequence: number;
}

interface RichTextItem {
	type: string;
	plain_text: string;
	text?: {
		content: string;
		link?: { url: string } | null;
	};
	annotations?: {
		bold: boolean;
		italic: boolean;
		strikethrough: boolean;
		underline: boolean;
		code: boolean;
	};
	href?: string | null;
}

interface ParagraphBlock {
	type: 'paragraph';
	paragraph: {
		rich_text: RichTextItem[];
	};
}

// Utility: Convert rich text array to plain text
function richTextToPlain(richText: RichTextItem[]): string {
	return richText.map((item) => item.plain_text).join('');
}

// Utility: Convert rich text array to markdown
function richTextToMarkdown(richText: RichTextItem[]): string {
	return richText
		.map((item) => {
			if (item.type !== 'text' || !item.text) {
				return item.plain_text;
			}

			let text = item.text.content;
			const annotations = item.annotations;

			if (annotations) {
				if (annotations.code) text = `\`${text}\``;
				if (annotations.bold) text = `**${text}**`;
				if (annotations.italic) text = `*${text}*`;
				if (annotations.strikethrough) text = `~~${text}~~`;
			}

			if (item.href || item.text.link?.url) {
				const url = item.href || item.text.link?.url;
				text = `[${text}](${url})`;
			}

			return text;
		})
		.join('');
}

// Utility: Slugify a title for filename
function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

// Fetch all sections from Notion
async function fetchSections(): Promise<Section[]> {
	console.log('Fetching sections from Notion...');

	const response = await notion.dataSources.query({
		data_source_id: POEMS_SECTIONS_DB!,
		filter: {
			and: [
				{
					property: 'Published',
					checkbox: { equals: true }
				}
			]
		},
		sorts: [{ direction: 'ascending', property: 'Sequence' }]
	} as any);

	return response.results.map((page: any, index: number) => {
		const props = page.properties;

		return {
			id: page.id,
			name: props.Name?.title?.[0]?.plain_text || '',
			quote: richTextToPlain(props.Quote?.rich_text || []),
			quoteAuthor: richTextToPlain(props.QuoteAuthor?.rich_text || []),
			act: richTextToPlain(props.Act?.rich_text || []),
			coverImage: page.cover?.external?.url || page.cover?.file?.url || '',
			secondaryImage: props.secondaryImage?.url || '',
			sequence: props.Sequence?.number ?? index
		};
	});
}

// Fetch all poems metadata from Notion
async function fetchPoems(): Promise<Poem[]> {
	console.log('Fetching poems from Notion...');

	const response = await notion.dataSources.query({
		data_source_id: ALL_SCRAPS_DB!,
		filter: {
			and: [
				{
					property: 'Published',
					checkbox: { equals: true }
				}
			]
		},
		sorts: [{ direction: 'ascending', property: 'Sequence' }]
	} as any);

	return response.results.map((page: any, index: number) => {
		const props = page.properties;

		return {
			id: page.id,
			title: props.Name?.title?.[0]?.plain_text || 'Untitled',
			sectionName: props.sectionName?.formula?.string || '',
			notLineated: props.NotLineated?.checkbox || false,
			sequence: props.Sequence?.number ?? index
		};
	});
}

// Fetch poem content blocks from Notion
async function fetchPoemContent(poemId: string): Promise<string> {
	const response = await notion.blocks.children.list({
		block_id: poemId,
		page_size: 100
	});

	const stanzas: string[] = [];

	for (const block of response.results as any[]) {
		if (block.type === 'paragraph') {
			const paragraph = block as ParagraphBlock;
			const text = richTextToMarkdown(paragraph.paragraph.rich_text);
			stanzas.push(text);
		}
	}

	// Join stanzas with double newlines (poem convention)
	return stanzas.join('\n\n');
}

// Generate markdown file content for a poem
function generatePoemMarkdown(poem: Poem, content: string): string {
	const frontmatter = [
		'---',
		`title: "${poem.title.replace(/"/g, '\\"')}"`,
		`section: "${poem.sectionName}"`,
		`sequence: ${poem.sequence}`,
		`notLineated: ${poem.notLineated}`,
		`notionId: "${poem.id}"`,
		'---',
		''
	].join('\n');

	return frontmatter + content + '\n';
}

// Main migration function
async function migrate() {
	console.log('🚀 Starting poem migration from Notion...\n');

	// Ensure output directory exists
	await fs.mkdir(CONTENT_REPO_PATH, { recursive: true });

	// Fetch data from Notion
	const sections = await fetchSections();
	console.log(`  Found ${sections.length} sections`);

	const poems = await fetchPoems();
	console.log(`  Found ${poems.length} poems\n`);

	// Write sections metadata
	console.log('Writing sections.json...');
	const sectionsPath = path.join(CONTENT_REPO_PATH, 'sections.json');
	await fs.writeFile(sectionsPath, JSON.stringify(sections, null, 2));
	console.log(`  ✓ Wrote ${sectionsPath}\n`);

	// Fetch and write each poem
	console.log('Fetching and writing poems...');
	let successCount = 0;
	let errorCount = 0;

	for (const poem of poems) {
		try {
			process.stdout.write(`  Processing "${poem.title}"... `);

			const content = await fetchPoemContent(poem.id);
			const markdown = generatePoemMarkdown(poem, content);
			const filename = `${slugify(poem.title)}.md`;
			const filepath = path.join(CONTENT_REPO_PATH, filename);

			await fs.writeFile(filepath, markdown);
			console.log('✓');
			successCount++;

			// Small delay to avoid rate limiting
			await new Promise((resolve) => setTimeout(resolve, 100));
		} catch (error) {
			console.log('✗');
			console.error(`    Error: ${error instanceof Error ? error.message : error}`);
			errorCount++;
		}
	}

	console.log('\n📊 Migration complete!');
	console.log(`  ✓ ${successCount} poems migrated successfully`);
	if (errorCount > 0) {
		console.log(`  ✗ ${errorCount} poems failed`);
	}
	console.log(`\n📁 Content written to: ${CONTENT_REPO_PATH}`);
}

// Run migration
migrate().catch((error) => {
	console.error('Migration failed:', error);
	process.exit(1);
});
