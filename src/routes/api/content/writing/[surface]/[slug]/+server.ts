import { error, json, type RequestHandler } from '@sveltejs/kit';
import {
	createBlogSourceChecksum,
	isValidBlogSlug,
	parseBlogMarkdown
} from '$lib/content/blog-source';
import { createContentSourceChecksum, isValidContentSlug } from '$lib/content/editable-source';
import { parsePoemMarkdown } from '$lib/content/poems';
import { parsePostcardMarkdown } from '$lib/content/postcards';
import { parseTallTaleMarkdown } from '$lib/content/tall-tales';
import { loadPreferredContentTextFile } from '$lib/server/content-repo';

const SURFACE_PATHS: Record<string, (slug: string) => string> = {
	blog: (slug) => `blog/${slug}.md`,
	poems: (slug) => `poems/${slug}.md`,
	postcards: (slug) => `postcards/${slug}.md`,
	'tall-tales': (slug) => `tall-tales/${slug}.md`
};

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.isOwner) {
		throw error(403, 'Owner session required.');
	}

	const surface = params.surface;
	const slug = params.slug;
	if (!surface || !(surface in SURFACE_PATHS)) {
		throw error(400, 'Invalid writing surface.');
	}

	const isValidSlug = surface === 'blog' ? isValidBlogSlug(slug ?? '') : isValidContentSlug(slug ?? '');
	if (!slug || !isValidSlug) {
		throw error(400, 'Invalid content slug.');
	}

	const filePathResolver = SURFACE_PATHS[surface as keyof typeof SURFACE_PATHS];
	if (!filePathResolver) {
		throw error(400, 'Invalid writing surface.');
	}
	const source = await loadPreferredContentTextFile(filePathResolver(slug));
	if (!source) {
		throw error(404, 'Content document not found.');
	}

	if (surface === 'blog') {
		const document = parseBlogMarkdown(source.content);
		return json({
			frontmatter: document.frontmatter,
			content: document.body,
			checksum: createBlogSourceChecksum(source.content),
			rawSource: source.content
		});
	}

	if (surface === 'poems') {
		const document = parsePoemMarkdown(source.content);
		return json({
			frontmatter: document.frontmatter,
			content: document.body,
			checksum: createContentSourceChecksum(source.content),
			rawSource: source.content
		});
	}

	if (surface === 'postcards') {
		const document = parsePostcardMarkdown(source.content);
		return json({
			frontmatter: document.frontmatter,
			content: document.body,
			checksum: createContentSourceChecksum(source.content),
			rawSource: source.content
		});
	}

	const document = parseTallTaleMarkdown(source.content);
	return json({
		frontmatter: document.frontmatter,
		content: document.body,
		checksum: createContentSourceChecksum(source.content),
		rawSource: source.content
	});
};
