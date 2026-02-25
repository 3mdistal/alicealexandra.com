/**
 * Utilities for loading tall tales content from local markdown files
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const CONTENT_PATH = path.join(process.cwd(), 'content', 'tall-tales');

export interface SectionTheme {
	backgroundImage: string;
	backgroundImageOpacity?: number;
	backgroundColor?: string;
	overlayColor?: string;
	textColor: string;
	fontFamily?: string;
}

export interface TallTaleMeta {
	slug: string;
	title: string;
	description: string;
	coverImage: string;
	audio?: {
		src: string;
		loop?: boolean;
	};
}

export interface TallTaleSection {
	theme: SectionTheme;
	content: string;
}

export interface TallTale extends TallTaleMeta {
	sections: TallTaleSection[];
}

export function normalizeHeroImage(value: unknown): string | undefined {
	if (typeof value !== 'string') return undefined;
	let trimmed = value.trim();
	if (!trimmed) return undefined;

	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		trimmed = trimmed.slice(1, -1).trim();
	}

	const match = trimmed.match(/https?:\/\/\S+/);
	if (!match) return undefined;

	let url = match[0].trim();
	const secondMatch = Array.from(url.matchAll(/https?:\/\//g));
	const nextUrlMatch = secondMatch[1];
	if (nextUrlMatch?.index !== undefined) {
		url = url.slice(0, nextUrlMatch.index);
	}

	if (!url) return undefined;
	if (/[\s'")]/.test(url)) return undefined;

	try {
		const parsed = new URL(url);
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
	} catch {
		return undefined;
	}

	return url;
}

function parseFrontmatterAndSections(content: string) {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
	const match = content.match(frontmatterRegex);

	if (!match || !match[1]) {
		throw new Error('No frontmatter found in markdown file');
	}

	const frontmatterStr = match[1];
	const body = content.slice(match[0].length);

	const frontmatter: any = { sections: [] };
	
	let inSections = false;
	let currentSection: any = null;

	const lines = frontmatterStr.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line === undefined) continue;
		
		if (line.trim() === '') continue;
		
		if (line.startsWith('sections:')) {
			inSections = true;
			continue;
		}

		if (inSections && line.startsWith('  -')) {
			if (currentSection) {
				frontmatter.sections.push(currentSection);
			}
			currentSection = {};
			
			const keyVal = line.slice(3).trim(); // remove '  -'
			const colonIndex = keyVal.indexOf(':');
			if (colonIndex > 0) {
				const key = keyVal.slice(0, colonIndex).trim();
				let val = keyVal.slice(colonIndex + 1).trim();
				if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
					val = val.slice(1, -1);
				}
				currentSection[key] = val;
			}
			continue;
		}
		
		if (inSections && line.startsWith('    ')) {
			const keyVal = line.trim();
			const colonIndex = keyVal.indexOf(':');
			if (colonIndex > 0) {
				const key = keyVal.slice(0, colonIndex).trim();
				let val = keyVal.slice(colonIndex + 1).trim();
				if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
					val = val.slice(1, -1);
				}
				if (currentSection) {
					currentSection[key] = val;
				}
			}
			continue;
		}
		
		if (inSections && !line.startsWith(' ')) {
			inSections = false;
			if (currentSection) {
				frontmatter.sections.push(currentSection);
				currentSection = null;
			}
		}

		if (!inSections) {
			const colonIndex = line.indexOf(':');
			if (colonIndex > 0) {
				const key = line.slice(0, colonIndex).trim();
				let val: any = line.slice(colonIndex + 1).trim();
				if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
					val = val.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
				} else if (val === 'true') val = true;
				else if (val === 'false') val = false;
				else if (!isNaN(Number(val))) val = Number(val);
				
				frontmatter[key] = val;
			}
		}
	}
	
	if (currentSection) {
		frontmatter.sections.push(currentSection);
	}

	// Parse sections based on divider
	const divider = frontmatter.sectionDivider === 'hr' ? '\n---\n' : '\n## ';
	let rawSections = body.split(divider);
	
	// Clean up '## ' prefix if we split by '## '
	if (frontmatter.sectionDivider !== 'hr') {
		rawSections = rawSections.map((s, i) => i === 0 ? s : '## ' + s);
	}

	const sections = frontmatter.sections.map((theme: any, index: number) => ({
		theme: {
			backgroundImage: normalizeHeroImage(theme.backgroundImage) || '',
			backgroundImageOpacity: theme.backgroundImageOpacity !== undefined ? Number(theme.backgroundImageOpacity) : undefined,
			backgroundColor: theme.backgroundColor,
			overlayColor: theme.overlayColor,
			textColor: theme.textColor || '#ffffff',
			fontFamily: theme.fontFamily
		},
		content: rawSections[index]?.trim() || ''
	}));

	return {
		frontmatter,
		sections
	};
}

export async function loadTallTalesMeta(): Promise<TallTaleMeta[]> {
	const metadataPath = path.join(CONTENT_PATH, 'metadata.json');
	try {
		const content = await fs.readFile(metadataPath, 'utf-8');
		const metadata = JSON.parse(content) as TallTaleMeta[];
		return metadata.map(meta => ({
			...meta,
			coverImage: normalizeHeroImage(meta.coverImage) || meta.coverImage
		}));
	} catch (err: any) {
		if (err?.code === 'ENOENT') return [];
		throw err;
	}
}

export async function loadTallTaleBySlug(slug: string): Promise<TallTale | null> {
	const filePath = path.join(CONTENT_PATH, `${slug}.md`);
	try {
		const fileContent = await fs.readFile(filePath, 'utf-8');
		const { frontmatter, sections } = parseFrontmatterAndSections(fileContent);

		return {
			slug: frontmatter.slug,
			title: frontmatter.title,
			description: frontmatter.description,
			coverImage: normalizeHeroImage(frontmatter.heroImage) || '',
			audio: frontmatter.audio,
			sections
		};
	} catch (err: any) {
		if (err?.code === 'ENOENT') return null;
		const message = err instanceof Error ? err.message : String(err);
		throw new Error(`Failed to load tall tale "${slug}" from ${filePath}: ${message}`);
	}
}
