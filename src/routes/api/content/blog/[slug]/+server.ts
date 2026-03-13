import { error, json, type RequestHandler } from '@sveltejs/kit';
import { loadRawBlogMarkdownBySlug } from '$lib/content/blog-source';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.isOwner) {
		throw error(403, 'Owner session required.');
	}

	const slug = params.slug;
	if (!slug) {
		throw error(400, 'Invalid blog slug.');
	}

	const document = await loadRawBlogMarkdownBySlug(slug);
	if (!document) {
		throw error(404, 'Blog post not found.');
	}

	return json({
		frontmatter: document.frontmatter,
		content: document.content,
		checksum: document.checksum,
		rawSource: document.rawSource
	});
};
