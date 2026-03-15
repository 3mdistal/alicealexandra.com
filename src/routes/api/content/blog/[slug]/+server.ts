import { error, json, type RequestHandler } from '@sveltejs/kit';
import {
	createBlogSourceChecksum,
	isValidBlogSlug,
	parseBlogMarkdown
} from '$lib/content/blog-source';
import { loadPreferredContentTextFile } from '$lib/server/content-repo';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.isOwner) {
		throw error(403, 'Owner session required.');
	}

	const slug = params.slug;
	if (!slug || !isValidBlogSlug(slug)) {
		throw error(400, 'Invalid blog slug.');
	}

	const source = await loadPreferredContentTextFile(`blog/${slug}.md`);
	if (!source) {
		throw error(404, 'Blog post not found.');
	}

	const document = parseBlogMarkdown(source.content);
	return json({
		frontmatter: document.frontmatter,
		content: document.body,
		checksum: createBlogSourceChecksum(source.content),
		rawSource: source.content
	});
};
