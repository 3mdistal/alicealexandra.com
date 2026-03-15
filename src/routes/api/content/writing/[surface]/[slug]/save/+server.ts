import { error, json, type RequestHandler } from '@sveltejs/kit';
import type { BlogFrontmatter } from '$lib/content/blog-source';
import { isValidBlogSlug } from '$lib/content/blog-source';
import type { PoemFrontmatter } from '$lib/content/poems';
import { normalizePoemFrontmatter } from '$lib/content/poems';
import type { PostcardFrontmatter } from '$lib/content/postcards';
import { normalizePostcardFrontmatter } from '$lib/content/postcards';
import type { TallTaleFrontmatter } from '$lib/content/tall-tales';
import { isValidContentSlug } from '$lib/content/editable-source';
import {
	PublishError,
	saveBlogPost,
	savePoem,
	savePostcard,
	saveTallTale
} from '$lib/server/blog-publishing';

interface SaveWritingRequest {
	frontmatter?:
		| Partial<BlogFrontmatter>
		| Partial<PoemFrontmatter>
		| Partial<PostcardFrontmatter>
		| Partial<TallTaleFrontmatter>;
	content?: string;
	originalChecksum?: string;
}

function normalizeTallTaleFrontmatter(
	frontmatter: Partial<TallTaleFrontmatter>,
	slug: string
): TallTaleFrontmatter {
	const sections = Array.isArray(frontmatter.sections)
		? frontmatter.sections.map((section) => ({
				backgroundImage: typeof section.backgroundImage === 'string' ? section.backgroundImage : '',
				textColor: typeof section.textColor === 'string' ? section.textColor : '#ffffff',
				...(typeof section.backgroundImageOpacity === 'number'
					? { backgroundImageOpacity: section.backgroundImageOpacity }
					: {}),
				...(typeof section.backgroundColor === 'string'
					? { backgroundColor: section.backgroundColor }
					: {}),
				...(typeof section.overlayColor === 'string'
					? { overlayColor: section.overlayColor }
					: {}),
				...(typeof section.fontFamily === 'string' ? { fontFamily: section.fontFamily } : {})
			}))
		: [];

	return {
		title: typeof frontmatter.title === 'string' ? frontmatter.title : '',
		slug,
		description: typeof frontmatter.description === 'string' ? frontmatter.description : '',
		heroImage: typeof frontmatter.heroImage === 'string' ? frontmatter.heroImage : '',
		lastEditedTime: typeof frontmatter.lastEditedTime === 'string' ? frontmatter.lastEditedTime : '',
		notionId: typeof frontmatter.notionId === 'string' ? frontmatter.notionId : '',
		sectionDivider: frontmatter.sectionDivider === 'heading' ? 'heading' : 'hr',
		...(frontmatter.audio && typeof frontmatter.audio === 'object'
			? {
					audio: {
						src: typeof frontmatter.audio.src === 'string' ? frontmatter.audio.src : '',
						...(typeof frontmatter.audio.loop === 'boolean'
							? { loop: frontmatter.audio.loop }
							: {})
					}
				}
			: {}),
		sections
	};
}

export const POST: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.isOwner) {
		throw error(403, 'Owner session required.');
	}

	const surface = params.surface;
	const slug = params.slug;
	if (!surface || !slug) {
		throw error(400, 'Invalid content request.');
	}

	const isValidSlug = surface === 'blog' ? isValidBlogSlug(slug) : isValidContentSlug(slug);
	if (!isValidSlug) {
		throw error(400, 'Invalid content slug.');
	}

	const payload = (await request.json()) as SaveWritingRequest;
	const content = payload.content;
	const originalChecksum = payload.originalChecksum;
	if (typeof content !== 'string' || typeof originalChecksum !== 'string') {
		throw error(400, 'Markdown content and original checksum are required.');
	}

	try {
		if (surface === 'blog') {
			const blogFrontmatter = (payload.frontmatter ?? {}) as Partial<BlogFrontmatter>;
			return json(
				await saveBlogPost({
					slug,
					frontmatter: {
						title: typeof blogFrontmatter.title === 'string' ? blogFrontmatter.title : '',
						slug,
						subtitle: typeof blogFrontmatter.subtitle === 'string' ? blogFrontmatter.subtitle : '',
						summary: typeof blogFrontmatter.summary === 'string' ? blogFrontmatter.summary : '',
						ogDescription:
							typeof blogFrontmatter.ogDescription === 'string' ? blogFrontmatter.ogDescription : '',
						category: typeof blogFrontmatter.category === 'string' ? blogFrontmatter.category : '',
						publicationDate:
							typeof blogFrontmatter.publicationDate === 'string'
								? blogFrontmatter.publicationDate
								: '',
						formattedPublicationDate:
							typeof blogFrontmatter.formattedPublicationDate === 'string'
								? blogFrontmatter.formattedPublicationDate
								: '',
						coverImage:
							typeof blogFrontmatter.coverImage === 'string' ? blogFrontmatter.coverImage : '',
						coverImageCaption:
							typeof blogFrontmatter.coverImageCaption === 'string'
								? blogFrontmatter.coverImageCaption
								: '',
						notionId: typeof blogFrontmatter.notionId === 'string' ? blogFrontmatter.notionId : ''
					},
					content,
					originalChecksum
				})
			);
		}

		if (surface === 'poems') {
			return json(
				await savePoem({
					slug,
					frontmatter: normalizePoemFrontmatter(
						(payload.frontmatter ?? {}) as Partial<PoemFrontmatter>
					),
					content,
					originalChecksum
				})
			);
		}

		if (surface === 'postcards') {
			return json(
				await savePostcard({
					slug,
					frontmatter: normalizePostcardFrontmatter(
						(payload.frontmatter ?? {}) as Partial<PostcardFrontmatter>,
						slug
					),
					content,
					originalChecksum
				})
			);
		}

		if (surface === 'tall-tales') {
			return json(
				await saveTallTale({
					slug,
					frontmatter: normalizeTallTaleFrontmatter(
						(payload.frontmatter ?? {}) as Partial<TallTaleFrontmatter>,
						slug
					),
					content,
					originalChecksum
				})
			);
		}

		throw error(400, 'Invalid writing surface.');
	} catch (caughtError) {
		if (caughtError instanceof PublishError) {
			throw error(caughtError.status, caughtError.message);
		}

		throw error(500, 'Failed to save content document.');
	}
};
