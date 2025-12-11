/**
 * Migration script: Fetch blog posts from Notion and convert to local markdown files
 *
 * Usage: npx tsx scripts/migrate-blog.ts
 *
 * Requires environment variables:
 *   - NOTION_KEY: Notion API integration token
 *   - BLOGS_DB: Database ID for blog posts
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
const CONTENT_REPO_PATH = path.resolve(__dirname, '../../teenylilcontent/blog');

// Environment variables
const NOTION_KEY = process.env.NOTION_KEY;
const BLOGS_DB = process.env.BLOGS_DB;

if (!NOTION_KEY || !BLOGS_DB) {
	console.error('Missing required environment variables:');
	if (!NOTION_KEY) console.error('  - NOTION_KEY');
	if (!BLOGS_DB) console.error('  - BLOGS_DB');
	process.exit(1);
}

const notion = new Client({
	auth: NOTION_KEY,
	notionVersion: '2025-09-03'
});

// Types
interface BlogPost {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	summary: string;
	ogDescription: string;
	category: string;
	publicationDate: string;
	formattedPublicationDate: string;
	readTime: string;
	coverImage: string;
	coverImageCaption: string;
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

// Utility: Slugify a title for filename (fallback if no slug property)
function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

// Fetch all published blog posts from Notion
async function fetchBlogPosts(): Promise<BlogPost[]> {
	console.log('Fetching blog posts from Notion...');

	const today = new Date().toISOString();

	const response = await notion.dataSources.query({
		data_source_id: BLOGS_DB!,
		filter: {
			and: [
				{
					property: 'Publication Date',
					date: {
						on_or_before: today
					}
				}
			]
		},
		sorts: [
			{
				direction: 'descending',
				property: 'Publication Date'
			}
		]
	} as any);

	return response.results.map((page: any) => {
		const props = page.properties;

		// Get cover image
		let coverImage = '';
		let coverImageCaption = '';
		if (page.cover) {
			if (page.cover.type === 'external') {
				coverImage = page.cover.external.url;
			} else if (page.cover.type === 'file') {
				coverImage = page.cover.file.url;
			}
			if (page.cover.caption && page.cover.caption.length > 0) {
				coverImageCaption = richTextToPlain(page.cover.caption);
			}
		}

		// Get publication date
		let publicationDate = '';
		let formattedPublicationDate = '';
		if (props['Publication Date']?.date?.start) {
			publicationDate = props['Publication Date'].date.start;
			const date = new Date(publicationDate);
			formattedPublicationDate = date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		}
		// Check for formula-based formatted date
		if (props['FormattedPublicationDate']?.formula?.string) {
			formattedPublicationDate = props['FormattedPublicationDate'].formula.string;
		}

		// Get reading time
		let readTime = '';
		if (props['ReadTime']?.formula?.string) {
			readTime = props['ReadTime'].formula.string;
		}

		return {
			id: page.id,
			slug: props['Slug']?.url || slugify(props['Name']?.title?.[0]?.plain_text || 'untitled'),
			title: props['Name']?.title?.[0]?.plain_text || 'Untitled',
			subtitle: richTextToPlain(props['Subtitle']?.rich_text || []),
			summary: richTextToPlain(props['Summary']?.rich_text || []),
			ogDescription: richTextToPlain(props['OGDescription']?.rich_text || []),
			category: props['Category']?.select?.name || 'Article',
			publicationDate,
			formattedPublicationDate,
			readTime,
			coverImage,
			coverImageCaption
		};
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

		case 'code':
			const language = block.code.language || '';
			const code = richTextToPlain(block.code.rich_text);
			return `\`\`\`${language}\n${code}\n\`\`\``;

		case 'divider':
			return '---';

		case 'image':
			let imageUrl = '';
			if (block.image.type === 'external') {
				imageUrl = block.image.external.url;
			} else if (block.image.type === 'file') {
				imageUrl = block.image.file.url;
			}
			const caption = block.image.caption?.length
				? richTextToPlain(block.image.caption)
				: 'Image';
			return `![${caption}](${imageUrl})`;

		case 'callout':
			const icon = block.callout.icon?.emoji || '💡';
			const calloutText = richTextToMarkdown(block.callout.rich_text);
			return `> ${icon} ${calloutText}`;

		case 'toggle':
			// Toggles with children would need recursive handling
			return `<details>\n<summary>${richTextToMarkdown(block.toggle.rich_text)}</summary>\n</details>`;

		case 'bookmark':
			const bookmarkUrl = block.bookmark.url || '';
			const bookmarkCaption = block.bookmark.caption?.length
				? richTextToPlain(block.bookmark.caption)
				: bookmarkUrl;
			return `[${bookmarkCaption}](${bookmarkUrl})`;

		case 'embed':
			return `[Embed](${block.embed.url})`;

		case 'video':
			let videoUrl = '';
			if (block.video.type === 'external') {
				videoUrl = block.video.external.url;
			}
			return `[Video](${videoUrl})`;

		case 'table_of_contents':
			// This will be handled client-side
			return '<!-- TOC -->';

		default:
			console.warn(`  Warning: Unhandled block type "${type}"`);
			return '';
	}
}

// Fetch and convert blog post content blocks to markdown
async function fetchPostContent(postId: string): Promise<string> {
	const response = await notion.blocks.children.list({
		block_id: postId,
		page_size: 100
	});

	const lines: string[] = [];

	for (const block of response.results as any[]) {
		const markdown = blockToMarkdown(block);
		if (markdown) {
			lines.push(markdown);
		}

		// Handle blocks with children (nested lists, toggles, etc.)
		if (block.has_children && block.type !== 'toggle') {
			const children = await notion.blocks.children.list({
				block_id: block.id,
				page_size: 100
			});

			for (const child of children.results as any[]) {
				const childMarkdown = blockToMarkdown(child);
				if (childMarkdown) {
					// Indent nested content
					lines.push('  ' + childMarkdown);
				}
			}
		}
	}

	return lines.join('\n\n');
}

// Generate markdown file content for a blog post
function generateBlogMarkdown(post: BlogPost, content: string): string {
	const frontmatter = [
		'---',
		`title: "${post.title.replace(/"/g, '\\"')}"`,
		`slug: "${post.slug}"`,
		`subtitle: "${post.subtitle.replace(/"/g, '\\"')}"`,
		`summary: "${post.summary.replace(/"/g, '\\"')}"`,
		`ogDescription: "${post.ogDescription.replace(/"/g, '\\"')}"`,
		`category: "${post.category}"`,
		`publicationDate: "${post.publicationDate}"`,
		`formattedPublicationDate: "${post.formattedPublicationDate}"`,
		`readTime: "${post.readTime}"`,
		`coverImage: "${post.coverImage}"`,
		`coverImageCaption: "${post.coverImageCaption.replace(/"/g, '\\"')}"`,
		`notionId: "${post.id}"`,
		'---',
		''
	].join('\n');

	return frontmatter + content + '\n';
}

// Main migration function
async function migrate() {
	console.log('🚀 Starting blog migration from Notion...\n');

	// Ensure output directory exists
	await fs.mkdir(CONTENT_REPO_PATH, { recursive: true });

	// Fetch blog posts from Notion
	const posts = await fetchBlogPosts();
	console.log(`  Found ${posts.length} blog posts\n`);

	// Create posts metadata file (for listing page)
	console.log('Writing posts.json...');
	const postsMetadata = posts.map((post) => ({
		id: post.id,
		slug: post.slug,
		title: post.title,
		subtitle: post.subtitle,
		category: post.category,
		publicationDate: post.publicationDate,
		formattedPublicationDate: post.formattedPublicationDate,
		readTime: post.readTime,
		coverImage: post.coverImage
	}));
	const postsPath = path.join(CONTENT_REPO_PATH, 'posts.json');
	await fs.writeFile(postsPath, JSON.stringify(postsMetadata, null, 2));
	console.log(`  ✓ Wrote ${postsPath}\n`);

	// Fetch and write each blog post
	console.log('Fetching and writing blog posts...');
	let successCount = 0;
	let errorCount = 0;

	for (const post of posts) {
		try {
			process.stdout.write(`  Processing "${post.title}"... `);

			const content = await fetchPostContent(post.id);
			const markdown = generateBlogMarkdown(post, content);
			const filename = `${post.slug}.md`;
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
	console.log(`  ✓ ${successCount} blog posts migrated successfully`);
	if (errorCount > 0) {
		console.log(`  ✗ ${errorCount} blog posts failed`);
	}
	console.log(`\n📁 Content written to: ${CONTENT_REPO_PATH}`);
}

// Run migration
migrate().catch((error) => {
	console.error('Migration failed:', error);
	process.exit(1);
});
