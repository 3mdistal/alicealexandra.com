import * as fs from 'fs/promises';
import * as path from 'path';

const CONTENT_PATH = path.join(process.cwd(), 'content', 'studio');

// ==================== STUDIO CARDS ====================

export interface StudioCard {
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
	description: string;
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
