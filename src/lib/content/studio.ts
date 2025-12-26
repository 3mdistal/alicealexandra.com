import * as fs from 'fs/promises';
import * as path from 'path';
import type { RichTextItemResponse } from '$lib/notion/types/notion-types';

const CONTENT_PATH = path.join(process.cwd(), 'content', 'studio');

// Rich text wrapper type (matches Notion format for TextMacro compatibility)
export interface RichTextWrapper {
	rich_text: RichTextItemResponse[];
}

// ==================== STUDIO CARDS ====================

export interface StudioCard {
	id: string;
	title: string;
	subtitle: RichTextWrapper;
	logoText: RichTextWrapper;
	imageUrl: string;
	imageAlt: string;
	description: RichTextWrapper;
	buttonText: string;
	destinationUrl: string;
	order: number;
}

interface StudioCardsFile {
	$schema?: string;
	data: StudioCard[];
}

export async function loadStudioCards(): Promise<StudioCard[]> {
	try {
		const filePath = path.join(CONTENT_PATH, 'cards.json');
		const content = await fs.readFile(filePath, 'utf-8');
		const parsed: StudioCardsFile = JSON.parse(content);
		return parsed.data.sort((a, b) => a.order - b.order);
	} catch {
		console.warn('Could not load studio cards from local content');
		return [];
	}
}

// ==================== ILLUSTRATIONS ====================

export interface Illustration {
	id: string;
	name: string;
	imageUrl: string;
	date: string;
	description: RichTextWrapper;
	order: number;
}

interface IllustrationsFile {
	$schema?: string;
	data: Illustration[];
}

export async function loadIllustrations(): Promise<Illustration[]> {
	try {
		const filePath = path.join(CONTENT_PATH, 'illustrations.json');
		const content = await fs.readFile(filePath, 'utf-8');
		const parsed: IllustrationsFile = JSON.parse(content);
		return parsed.data.sort((a, b) => a.order - b.order);
	} catch {
		console.warn('Could not load illustrations from local content');
		return [];
	}
}
