import { createHash } from 'node:crypto';

export interface EditableMarkdownDocument<TFrontmatter> {
	frontmatter: TFrontmatter;
	content: string;
	rawSource: string;
	checksum: string;
}

export function isValidContentSlug(slug: string): boolean {
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function createContentSourceChecksum(source: string): string {
	return createHash('sha1').update(source).digest('hex');
}
