import { error, json, type RequestHandler } from '@sveltejs/kit';
import {
	normalizeBlogFrontmatter,
	type BlogFrontmatter,
	isValidBlogSlug
} from '$lib/content/blog-source';
import { PublishError, saveBlogPost } from '$lib/server/blog-publishing';

interface SaveBlogRequest {
	frontmatter?: Partial<BlogFrontmatter>;
	content?: string;
	originalChecksum?: string;
}

export const POST: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.isOwner) {
		throw error(403, 'Owner session required.');
	}

	const slug = params.slug;
	if (!slug || !isValidBlogSlug(slug)) {
		throw error(400, 'Invalid blog slug.');
	}

	const payload = (await request.json()) as SaveBlogRequest;
	const content = payload.content;
	const originalChecksum = payload.originalChecksum;

	if (typeof content !== 'string' || typeof originalChecksum !== 'string') {
		throw error(400, 'Markdown content and original checksum are required.');
	}

	try {
		const result = await saveBlogPost({
			slug,
			frontmatter: normalizeBlogFrontmatter(payload.frontmatter ?? {}, slug),
			content,
			originalChecksum
		});

		return json(result);
	} catch (caughtError) {
		if (caughtError instanceof PublishError) {
			throw error(caughtError.status, caughtError.message);
		}

		throw error(500, 'Failed to save blog post.');
	}
};
