/**
 * Migration script: Export Professional Publications from Notion to local JSON
 *
 * Usage: npx tsx scripts/migrate-publications.ts
 *
 * Requires environment variables:
 *   - NOTION_KEY: Notion API integration token
 *   - PROFESSIONAL_DB: Database ID for professional publications
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
const isLocal = process.argv.includes('--local');
const CONTENT_REPO_PATH = isLocal
	? path.resolve(__dirname, '../content/career')
	: path.resolve(__dirname, '../../teenylilcontent/career');

// Environment variables
const NOTION_KEY = process.env.NOTION_KEY;
const PROFESSIONAL_DB = process.env.PROFESSIONAL_DB;

if (!NOTION_KEY) {
	console.error('Missing required environment variable: NOTION_KEY');
	process.exit(1);
}

if (!PROFESSIONAL_DB) {
	console.error('Missing required environment variable: PROFESSIONAL_DB');
	process.exit(1);
}

const notion = new Client({
	auth: NOTION_KEY,
	notionVersion: '2025-09-03'
});

// Types
interface Publication {
	id: string;
	name: string;
	date: string;
	type: string;
	link: string;
	description: string;
}

// Utility: Extract plain text from rich_text array
function richTextToPlain(richText: any[]): string {
	return richText.map((item) => item.plain_text || '').join('');
}

async function fetchPublications(): Promise<Publication[]> {
	console.log('Fetching professional publications from Notion...');

	const response = await notion.dataSources.query({
		data_source_id: PROFESSIONAL_DB!,
		sorts: [
			{
				direction: 'descending',
				property: 'Date'
			}
		]
	} as any);

	console.log(`Found ${response.results.length} publications`);

	return response.results.map((page: any) => {
		const props = page.properties;

		return {
			id: page.id,
			name: props['Name']?.title?.[0]?.plain_text || 'Untitled',
			date: props['Date']?.date?.start || '',
			type: props['Type']?.select?.name || '',
			link: props['Link']?.url || '',
			description: richTextToPlain(props['Description']?.rich_text || [])
		};
	});
}

async function main() {
	// Ensure output directory exists
	await fs.mkdir(CONTENT_REPO_PATH, { recursive: true });

	// Fetch and write publications
	const publications = await fetchPublications();
	if (publications.length > 0) {
		const output = {
			$schema: '../schemas/publications.schema.json',
			data: publications
		};
		const outputPath = path.join(CONTENT_REPO_PATH, 'publications.json');
		await fs.writeFile(outputPath, JSON.stringify(output, null, 2) + '\n');
		console.log(`✅ Wrote ${publications.length} publications to ${outputPath}`);
	}

	console.log('\n✅ Publications migration complete!');
}

main().catch((error) => {
	console.error('Migration failed:', error);
	process.exit(1);
});
