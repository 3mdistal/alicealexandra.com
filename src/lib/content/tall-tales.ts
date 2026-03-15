/**
 * Utilities for parsing and serializing tall tales markdown content
 */

import type { EditableMarkdownDocument } from '$lib/content/editable-source';

const TALL_TALE_TOP_LEVEL_FIELDS = [
	'title',
	'slug',
	'description',
	'heroImage',
	'lastEditedTime',
	'notionId',
	'sectionDivider'
] as const;

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

export interface TallTaleSectionFrontmatter {
	backgroundImage: string;
	backgroundImageOpacity?: number;
	backgroundColor?: string;
	overlayColor?: string;
	textColor: string;
	fontFamily?: string;
}

export interface TallTaleFrontmatter {
	title: string;
	slug: string;
	description: string;
	heroImage: string;
	lastEditedTime: string;
	notionId: string;
	sectionDivider: 'hr' | 'heading';
	audio?: {
		src: string;
		loop?: boolean;
	};
	sections: TallTaleSectionFrontmatter[];
}

export type EditableTallTaleDocument = EditableMarkdownDocument<TallTaleFrontmatter>;

function createEmptyTallTaleFrontmatter(): TallTaleFrontmatter {
	return {
		title: '',
		slug: '',
		description: '',
		heroImage: '',
		lastEditedTime: '',
		notionId: '',
		sectionDivider: 'hr',
		sections: []
	};
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

function parseScalarValue(value: string): string | number | boolean {
	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
	}

	if (value === 'true') {
		return true;
	}

	if (value === 'false') {
		return false;
	}

	if (!Number.isNaN(Number(value))) {
		return Number(value);
	}

	return value;
}

function escapeYamlString(value: string): string {
	return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function parseSectionValue(key: keyof TallTaleSectionFrontmatter, rawValue: string) {
	const value = parseScalarValue(rawValue);
	if (key === 'backgroundImageOpacity') {
		return typeof value === 'number' ? value : undefined;
	}

	return typeof value === 'string' ? value : String(value);
}

export function parseTallTaleMarkdown(content: string): {
	frontmatter: TallTaleFrontmatter;
	body: string;
} {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/;
	const match = content.match(frontmatterRegex);

	if (!match || !match[1]) {
		throw new Error('No frontmatter found in markdown file');
	}

	const frontmatterStr = match[1];
	const body = content.slice(match[0].length).trim();
	const frontmatter = createEmptyTallTaleFrontmatter();
	let inSections = false;
	let inAudio = false;
	let currentSection: TallTaleSectionFrontmatter | null = null;
	let currentAudio: TallTaleFrontmatter['audio'] | null = null;

	const flushSection = () => {
		if (currentSection) {
			frontmatter.sections.push({
				backgroundImage: currentSection.backgroundImage || '',
				textColor: currentSection.textColor || '#ffffff',
				...(currentSection.backgroundImageOpacity !== undefined
					? { backgroundImageOpacity: currentSection.backgroundImageOpacity }
					: {}),
				...(currentSection.backgroundColor ? { backgroundColor: currentSection.backgroundColor } : {}),
				...(currentSection.overlayColor ? { overlayColor: currentSection.overlayColor } : {}),
				...(currentSection.fontFamily ? { fontFamily: currentSection.fontFamily } : {})
			});
			currentSection = null;
		}
	};

	const flushAudio = () => {
		if (currentAudio?.src) {
			frontmatter.audio = currentAudio;
		}
		currentAudio = null;
	};

	for (const line of frontmatterStr.split('\n')) {
		if (!line.trim()) {
			continue;
		}

		if (line.startsWith('sections:')) {
			flushAudio();
			inAudio = false;
			inSections = true;
			continue;
		}

		if (line.startsWith('audio:')) {
			flushSection();
			inSections = false;
			inAudio = true;
			currentAudio = { src: '' };
			continue;
		}

		if (inSections && line.startsWith('  -')) {
			flushSection();
			currentSection = { backgroundImage: '', textColor: '#ffffff' };

			const keyValue = line.slice(3).trim();
			const colonIndex = keyValue.indexOf(':');
			if (colonIndex > 0) {
				const key = keyValue.slice(0, colonIndex).trim() as keyof TallTaleSectionFrontmatter;
				const value = keyValue.slice(colonIndex + 1).trim();
				currentSection[key] = parseSectionValue(key, value) as never;
			}
			continue;
		}

		if (inSections && line.startsWith('    ')) {
			const keyValue = line.trim();
			const colonIndex = keyValue.indexOf(':');
			if (colonIndex > 0 && currentSection) {
				const key = keyValue.slice(0, colonIndex).trim() as keyof TallTaleSectionFrontmatter;
				const value = keyValue.slice(colonIndex + 1).trim();
				currentSection[key] = parseSectionValue(key, value) as never;
			}
			continue;
		}

		if (inAudio && line.startsWith('  ')) {
			const keyValue = line.trim();
			const colonIndex = keyValue.indexOf(':');
			if (colonIndex > 0 && currentAudio) {
				const key = keyValue.slice(0, colonIndex).trim();
				const value = parseScalarValue(keyValue.slice(colonIndex + 1).trim());
				if (key === 'src') {
					currentAudio.src = String(value);
				}
				if (key === 'loop') {
					currentAudio.loop = value === true;
				}
			}
			continue;
		}

		if (inSections && !line.startsWith(' ')) {
			flushSection();
			inSections = false;
		}

		if (inAudio && !line.startsWith(' ')) {
			flushAudio();
			inAudio = false;
		}

		const colonIndex = line.indexOf(':');
		if (colonIndex <= 0) {
			continue;
		}

		const key = line.slice(0, colonIndex).trim() as (typeof TALL_TALE_TOP_LEVEL_FIELDS)[number];
		const value = parseScalarValue(line.slice(colonIndex + 1).trim());
		if (key === 'sectionDivider') {
			frontmatter.sectionDivider = value === 'heading' ? 'heading' : 'hr';
			continue;
		}

		frontmatter[key] = String(value) as never;
	}

	flushSection();
	flushAudio();

	return {
		frontmatter,
		body
	};
}

export function serializeTallTaleMarkdown(frontmatter: TallTaleFrontmatter, body: string): string {
	const frontmatterLines = TALL_TALE_TOP_LEVEL_FIELDS.map((field) => {
		if (field === 'sectionDivider') {
			return `${field}: "${frontmatter.sectionDivider}"`;
		}

		return `${field}: "${escapeYamlString(frontmatter[field] ?? '')}"`;
	});

	if (frontmatter.audio?.src.trim()) {
		frontmatterLines.push('audio:');
		frontmatterLines.push(`  src: "${escapeYamlString(frontmatter.audio.src)}"`);
		if (frontmatter.audio.loop !== undefined) {
			frontmatterLines.push(`  loop: ${frontmatter.audio.loop ? 'true' : 'false'}`);
		}
	}

	frontmatterLines.push('sections:');
	for (const section of frontmatter.sections) {
		frontmatterLines.push(
			`  - backgroundImage: "${escapeYamlString(section.backgroundImage || '')}"`
		);
		if (section.backgroundImageOpacity !== undefined) {
			frontmatterLines.push(`    backgroundImageOpacity: ${section.backgroundImageOpacity}`);
		}
		if (section.backgroundColor) {
			frontmatterLines.push(`    backgroundColor: "${escapeYamlString(section.backgroundColor)}"`);
		}
		if (section.overlayColor) {
			frontmatterLines.push(`    overlayColor: "${escapeYamlString(section.overlayColor)}"`);
		}
		frontmatterLines.push(`    textColor: "${escapeYamlString(section.textColor || '#ffffff')}"`);
		if (section.fontFamily) {
			frontmatterLines.push(`    fontFamily: "${escapeYamlString(section.fontFamily)}"`);
		}
	}

	return `---\n${frontmatterLines.join('\n')}\n---\n\n${body.trim()}\n`;
}

export function buildTallTaleSections(
	frontmatter: TallTaleFrontmatter,
	body: string
): TallTaleSection[] {
	const divider = frontmatter.sectionDivider === 'hr' ? '\n---\n' : '\n## ';
	let rawSections = body.split(divider);

	if (frontmatter.sectionDivider !== 'hr') {
		rawSections = rawSections.map((section, index) => (index === 0 ? section : `## ${section}`));
	}

	return frontmatter.sections.map((theme, index) => ({
		theme: {
			backgroundImage: normalizeHeroImage(theme.backgroundImage) || '',
			textColor: theme.textColor || '#ffffff',
			...(theme.backgroundImageOpacity !== undefined
				? { backgroundImageOpacity: Number(theme.backgroundImageOpacity) }
				: {}),
			...(theme.backgroundColor ? { backgroundColor: theme.backgroundColor } : {}),
			...(theme.overlayColor ? { overlayColor: theme.overlayColor } : {}),
			...(theme.fontFamily ? { fontFamily: theme.fontFamily } : {})
		},
		content: rawSections[index]?.trim() || ''
	}));
}
