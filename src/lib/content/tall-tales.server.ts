import fs from 'node:fs/promises';
import * as path from 'node:path';
import { createContentSourceChecksum } from '$lib/content/editable-source.server';
import {
	buildTallTaleSections,
	normalizeHeroImage,
	parseTallTaleMarkdown,
	type EditableTallTaleDocument,
	type TallTale,
	type TallTaleMeta
} from '$lib/content/tall-tales';

const CONTENT_PATH = path.join(process.cwd(), 'content', 'tall-tales');

export async function loadRawTallTaleMarkdownBySlug(
	slug: string
): Promise<EditableTallTaleDocument | null> {
	const filePath = path.join(CONTENT_PATH, `${slug}.md`);
	try {
		const rawSource = await fs.readFile(filePath, 'utf-8');
		const { frontmatter, body } = parseTallTaleMarkdown(rawSource);

		return {
			frontmatter,
			content: body,
			rawSource,
			checksum: createContentSourceChecksum(rawSource)
		};
	} catch (err: any) {
		if (err?.code === 'ENOENT') return null;
		const message = err instanceof Error ? err.message : String(err);
		throw new Error(`Failed to load tall tale "${slug}" from ${filePath}: ${message}`, { cause: err });
	}
}

export async function loadTallTalesMeta(): Promise<TallTaleMeta[]> {
	const metadataPath = path.join(CONTENT_PATH, 'metadata.json');
	try {
		const content = await fs.readFile(metadataPath, 'utf-8');
		const metadata = JSON.parse(content) as TallTaleMeta[];
		return metadata.map((meta) => ({
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
		const editableTallTale = await loadRawTallTaleMarkdownBySlug(slug);
		if (!editableTallTale) {
			return null;
		}

		const { frontmatter, content } = editableTallTale;
		return {
			slug: frontmatter.slug,
			title: frontmatter.title,
			description: frontmatter.description,
			coverImage: normalizeHeroImage(frontmatter.heroImage) || '',
			...(frontmatter.audio ? { audio: frontmatter.audio } : {}),
			sections: buildTallTaleSections(frontmatter, content)
		};
	} catch (err: any) {
		if (err?.code === 'ENOENT') return null;
		const message = err instanceof Error ? err.message : String(err);
		throw new Error(`Failed to load tall tale "${slug}" from ${filePath}: ${message}`, { cause: err });
	}
}
