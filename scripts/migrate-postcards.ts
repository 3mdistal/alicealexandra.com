/**
 * Migration script: Fetch postcards from Notion and convert to local markdown files
 *
 * Usage: npx tsx scripts/migrate-postcards.ts
 *
 * Requires environment variables:
 *   - NOTION_KEY: Notion API integration token
 *   - POSTCARDS_DB: Data source ID for postcards
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
	? path.resolve(__dirname, '../content/postcards')
	: path.resolve(__dirname, '../../teenylilcontent/postcards');

// Environment variables
const NOTION_KEY = process.env.NOTION_KEY;
const POSTCARDS_DB = process.env.POSTCARDS_DB;

if (!NOTION_KEY || !POSTCARDS_DB) {
	console.error('Missing required environment variables:');
	if (!NOTION_KEY) console.error('  - NOTION_KEY');
	if (!POSTCARDS_DB) console.error('  - POSTCARDS_DB');
	process.exit(1);
}

const notion = new Client({
	auth: NOTION_KEY,
	notionVersion: '2025-09-03'
});

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

interface PostcardMeta {
	id: string;
	slug: string;
	title: string;
	description: string;
	heroImage?: string;
	lastEditedTime: string;
}

// Utility: Escape HTML special characters
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
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

// Utility: Convert rich text array to HTML (for use inside HTML elements like callouts)
function richTextToHtml(richText: RichTextItem[]): string {
	return richText
		.map((item) => {
			if (item.type !== 'text' || !item.text) {
				return escapeHtml(item.plain_text);
			}

			let text = escapeHtml(item.text.content);
			const annotations = item.annotations;

			if (annotations) {
				if (annotations.code) text = `<code>${text}</code>`;
				if (annotations.bold) text = `<strong>${text}</strong>`;
				if (annotations.italic) text = `<em>${text}</em>`;
				if (annotations.strikethrough) text = `<del>${text}</del>`;
			}

			if (item.href || item.text.link?.url) {
				const url = item.href || item.text.link?.url;
				text = `<a href="${url}">${text}</a>`;
			}

			return text;
		})
		.join('');
}

// Utility: Slugify a title for filename (fallback if no slug property)
function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

// Fetch all postcards from Notion
async function fetchPostcards(): Promise<PostcardMeta[]> {
	console.log('Fetching postcards from Notion...');

	const response = await notion.dataSources.query({
		data_source_id: POSTCARDS_DB!,
		sorts: [
			{
				direction: 'descending',
				property: 'Title'
			}
		]
	} as any);

	return response.results
		.filter((r: any) => (r as any)?.object === 'page' && (r as any)?.properties)
		.map((page: any): PostcardMeta => {
			const props = page.properties;

			const title = props.Title?.title?.[0]?.plain_text || 'Untitled';

			const slug =
				(props.Slug?.type === 'url' ? props.Slug.url : null) ||
				(props.Slug?.type === 'rich_text' ? props.Slug.rich_text?.[0]?.plain_text : null) ||
				slugify(title);

			const description = richTextToPlain(props.Description?.rich_text || []);

			const heroImage = props['Hero Image']?.type === 'url' ? props['Hero Image'].url || '' : '';

			const base: PostcardMeta = {
				id: page.id,
				slug,
				title,
				description,
				lastEditedTime: page.last_edited_time
			};

			return heroImage ? { ...base, heroImage } : base;
		});
}

// Convert a Notion block to markdown
function blockToMarkdown(block: any): string {
	const type = block.type;

	switch (type) {
		case 'paragraph':
			return richTextToMarkdown(block.paragraph.rich_text);

		case 'heading_1':
			return `# ${richTextToMarkdown(block.heading_1.rich_text)}`;

		case 'heading_2':
			return `## ${richTextToMarkdown(block.heading_2.rich_text)}`;

		case 'heading_3':
			return `### ${richTextToMarkdown(block.heading_3.rich_text)}`;

		case 'bulleted_list_item':
			return `- ${richTextToMarkdown(block.bulleted_list_item.rich_text)}`;

		case 'numbered_list_item':
			return `1. ${richTextToMarkdown(block.numbered_list_item.rich_text)}`;

		case 'quote':
			return `> ${richTextToMarkdown(block.quote.rich_text)}`;

		case 'code': {
			const language = block.code.language || '';
			const code = richTextToPlain(block.code.rich_text);
			return `\`\`\`${language}\n${code}\n\`\`\``;
		}

		case 'divider':
			return '---';

		case 'image': {
			let imageUrl = '';
			if (block.image.type === 'external') {
				imageUrl = block.image.external.url;
			} else if (block.image.type === 'file') {
				imageUrl = block.image.file.url;
			}
			const caption = block.image.caption?.length ? richTextToPlain(block.image.caption) : 'Image';
			return `![${caption}](${imageUrl})`;
		}

		case 'callout': {
			const icon = block.callout.icon?.emoji || '💡';
			const calloutText = richTextToHtml(block.callout.rich_text);
			return `<div class="callout"><span>${icon}</span><span>${calloutText}</span></div>`;
		}

		case 'bookmark': {
			const bookmarkUrl = block.bookmark.url || '';
			const bookmarkCaption = block.bookmark.caption?.length
				? richTextToPlain(block.bookmark.caption)
				: bookmarkUrl;
			return `[${bookmarkCaption}](${bookmarkUrl})`;
		}

		case 'embed':
			return `[Embed](${block.embed.url})`;

		case 'video': {
			let videoUrl = '';
			if (block.video.type === 'external') {
				videoUrl = block.video.external.url;
			}
			return `[Video](${videoUrl})`;
		}

		case 'table_of_contents':
			return '<!-- TOC -->';

		default:
			// Keep migration resilient
			console.warn(`  Warning: Unhandled block type "${type}"`);
			return '';
	}
}

function isListItem(type: string): boolean {
	return type === 'bulleted_list_item' || type === 'numbered_list_item';
}

// Fetch and convert postcard content blocks to markdown
async function fetchPostcardContent(postcardId: string): Promise<string> {
	const response = await notion.blocks.children.list({
		block_id: postcardId,
		page_size: 100
	});

	const blocks = response.results as any[];
	const outputParts: string[] = [];
	let i = 0;

	while (i < blocks.length) {
		const block = blocks[i];
		const blockType = block.type;

		// Group consecutive list items together
		if (isListItem(blockType)) {
			const listItems: string[] = [];
			let numberedIndex = 1;

			while (i < blocks.length && blocks[i].type === blockType) {
				const currentBlock = blocks[i];
				let markdown = blockToMarkdown(currentBlock);

				if (blockType === 'numbered_list_item') {
					markdown = markdown.replace(/^1\./, `${numberedIndex}.`);
					numberedIndex++;
				}

				listItems.push(markdown);

				if (currentBlock.has_children) {
					const children = await notion.blocks.children.list({
						block_id: currentBlock.id,
						page_size: 100
					});

					for (const child of children.results as any[]) {
						const childMarkdown = blockToMarkdown(child);
						if (childMarkdown) {
							listItems.push('  ' + childMarkdown);
						}
					}
				}

				i++;
			}

			outputParts.push(listItems.join('\n'));
		} else {
			const markdown = blockToMarkdown(block);
			if (markdown) {
				outputParts.push(markdown);
			}

			if (block.has_children && block.type !== 'toggle') {
				const children = await notion.blocks.children.list({
					block_id: block.id,
					page_size: 100
				});

				for (const child of children.results as any[]) {
					const childMarkdown = blockToMarkdown(child);
					if (childMarkdown) {
						outputParts.push('  ' + childMarkdown);
					}
				}
			}

			i++;
		}
	}

	return outputParts.join('\n\n');
}

function generatePostcardMarkdown(postcard: PostcardMeta, content: string): string {
	const frontmatter = [
		'---',
		`title: "${postcard.title.replace(/"/g, '\\"')}"`,
		`slug: "${postcard.slug}"`,
		`description: "${postcard.description.replace(/"/g, '\\"')}"`,
		`heroImage: "${(postcard.heroImage || '').replace(/"/g, '\\"')}"`,
		`lastEditedTime: "${postcard.lastEditedTime}"`,
		`notionId: "${postcard.id}"`,
		'---',
		''
	].join('\n');

	return frontmatter + content + '\n';
}

async function migrate() {
	console.log('🚀 Starting postcards migration from Notion...\n');

	await fs.mkdir(CONTENT_REPO_PATH, { recursive: true });

	const postcards = await fetchPostcards();
	console.log(`  Found ${postcards.length} postcards\n`);

	// Write metadata.json for listing page
	console.log('Writing metadata.json...');
	const metadataPath = path.join(CONTENT_REPO_PATH, 'metadata.json');
	await fs.writeFile(metadataPath, JSON.stringify(postcards, null, 2));
	console.log(`  ✓ Wrote ${metadataPath}\n`);

	console.log('Fetching and writing postcard markdown...');
	let successCount = 0;
	let errorCount = 0;

	for (const postcard of postcards) {
		try {
			process.stdout.write(`  Processing "${postcard.title}"... `);

			const content = await fetchPostcardContent(postcard.id);
			const markdown = generatePostcardMarkdown(postcard, content);
			const filename = `${postcard.slug}.md`;
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
	console.log(`  ✓ ${successCount} postcards migrated successfully`);
	if (errorCount > 0) {
		console.log(`  ✗ ${errorCount} postcards failed`);
	}
	console.log(`\n📁 Content written to: ${CONTENT_REPO_PATH}`);
}

migrate().catch((error) => {
	console.error('Migration failed:', error);
	process.exit(1);
});
