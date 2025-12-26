import * as fs from 'fs/promises';
import * as path from 'path';

const CONTENT_PATH = path.join(process.cwd(), 'content', 'career');

// ==================== PUBLICATIONS ====================

export interface Publication {
	id: string;
	name: string;
	date: string;
	type: 'Technical Blog' | 'Technical Guide' | 'Customer Story' | 'Enterprise Resource' | 'Product Feature' | 'Landing Page';
	link: string;
	description: string;
}

interface PublicationsFile {
	$schema?: string;
	data: Publication[];
}

export async function loadPublications(): Promise<Publication[]> {
	try {
		const filePath = path.join(CONTENT_PATH, 'publications.json');
		const content = await fs.readFile(filePath, 'utf-8');
		const parsed: PublicationsFile = JSON.parse(content);
		// Already sorted by date descending in the migration
		return parsed.data;
	} catch {
		console.warn('Could not load publications from local content');
		return [];
	}
}
