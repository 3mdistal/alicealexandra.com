/**
 * Migration script: Export Studio Cards and Illustrations from Notion to local JSON
 *
 * Usage: npx tsx scripts/migrate-studio.ts
 *
 * Requires environment variables:
 *   - NOTION_KEY: Notion API integration token
 *   - STUDIO_DB: Database ID for studio cards
 *   - ILLUSTRATIONS_DB: Database ID for illustrations
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
	? path.resolve(__dirname, '../content/studio')
	: path.resolve(__dirname, '../../teenylilcontent/studio');

// Environment variables
const NOTION_KEY = process.env.NOTION_KEY;
const STUDIO_DB = process.env.STUDIO_DB;
const ILLUSTRATIONS_DB = process.env.ILLUSTRATIONS_DB;

if (!NOTION_KEY) {
	console.error('Missing required environment variable: NOTION_KEY');
	process.exit(1);
}

const notion = new Client({
	auth: NOTION_KEY,
	notionVersion: '2025-09-03'
});

// Utility: Extract plain text from Notion rich_text arrays
function richTextToPlain(richText: any[]): string {
	return richText.map((item) => item.plain_text || '').join('');
}

// ==================== STUDIO CARDS ====================

interface StudioCard {
	id: string;
	title: string;
	subtitle: string;
	logoText: string;
	imageUrl: string;
	imageAlt: string;
	description: string;
	buttonText: string;
	destinationUrl: string;
	order: number;
}

async function fetchStudioCards(): Promise<StudioCard[]> {
	if (!STUDIO_DB) {
		console.error('Missing STUDIO_DB environment variable');
		return [];
	}

	console.log('Fetching studio cards from Notion...');

	const response = await notion.dataSources.query({
		data_source_id: STUDIO_DB,
		filter: {
			and: [
				{
					property: 'Published',
					checkbox: {
						equals: true
					}
				}
			]
		},
		sorts: [
			{
				direction: 'ascending',
				property: 'Order'
			}
		]
	} as any);

	console.log(`Found ${response.results.length} studio cards`);

	return response.results.map((page: any, index: number) => {
		const props = page.properties;

		return {
			id: page.id,
			title: props['Title']?.title?.[0]?.plain_text || 'Untitled',
			subtitle: richTextToPlain(props['Subtitle']?.rich_text || []),
			logoText: richTextToPlain(props['Shortened Logo Text']?.rich_text || []),
			imageUrl: props['Image']?.url || '',
			imageAlt: richTextToPlain(props['ImageAlt']?.rich_text || []),
			description: richTextToPlain(props['Description']?.rich_text || []),
			buttonText: richTextToPlain(props['ButtonText']?.rich_text || []),
			destinationUrl: props['Destination']?.url || '',
			order: props['Order']?.number ?? index
		};
	});
}

// ==================== ILLUSTRATIONS ====================

interface Illustration {
	id: string;
	name: string;
	imageUrl: string;
	date: string;
	description: string;
	order: number;
}

async function fetchIllustrations(): Promise<Illustration[]> {
	if (!ILLUSTRATIONS_DB) {
		console.error('Missing ILLUSTRATIONS_DB environment variable');
		return [];
	}

	console.log('Fetching illustrations from Notion...');

	const response = await notion.dataSources.query({
		data_source_id: ILLUSTRATIONS_DB,
		filter: {
			and: [
				{
					property: 'Published',
					checkbox: {
						equals: true
					}
				}
			]
		},
		sorts: [
			{
				direction: 'ascending',
				property: 'Order'
			}
		]
	} as any);

	console.log(`Found ${response.results.length} illustrations`);

	return response.results.map((page: any, index: number) => {
		const props = page.properties;

		// Date is a formula field
		let date = '';
		if (props['Date']?.formula?.string) {
			date = props['Date'].formula.string;
		} else if (props['Date']?.date?.start) {
			date = props['Date'].date.start;
		}

		return {
			id: page.id,
			name: props['Name']?.title?.[0]?.plain_text || 'Untitled',
			imageUrl: props['Image']?.url || '',
			date,
			description: richTextToPlain(props['Description']?.rich_text || []),
			order: props['Order']?.number ?? index
		};
	});
}

// ==================== MAIN ====================

async function main() {
	// Ensure output directory exists
	await fs.mkdir(CONTENT_REPO_PATH, { recursive: true });

	// Fetch and write studio cards
	const cards = await fetchStudioCards();
	if (cards.length > 0) {
		const cardsOutput = {
			$schema: '../schemas/studio-cards.schema.json',
			data: cards
		};
		const cardsPath = path.join(CONTENT_REPO_PATH, 'cards.json');
		await fs.writeFile(cardsPath, JSON.stringify(cardsOutput, null, 2) + '\n');
		console.log(`✅ Wrote ${cards.length} studio cards to ${cardsPath}`);
	}

	// Fetch and write illustrations
	const illustrations = await fetchIllustrations();
	if (illustrations.length > 0) {
		const illustrationsOutput = {
			$schema: '../schemas/illustrations.schema.json',
			data: illustrations
		};
		const illustrationsPath = path.join(CONTENT_REPO_PATH, 'illustrations.json');
		await fs.writeFile(illustrationsPath, JSON.stringify(illustrationsOutput, null, 2) + '\n');
		console.log(`✅ Wrote ${illustrations.length} illustrations to ${illustrationsPath}`);
	}

	console.log('\n✅ Studio migration complete!');
}

main().catch((error) => {
	console.error('Migration failed:', error);
	process.exit(1);
});
