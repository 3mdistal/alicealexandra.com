import type { BlogPostMeta } from '$lib/content/blog';
import {
	calculateBlogReadTimeFromContent,
	createBlogSourceChecksum,
	type BlogFrontmatter,
	isValidBlogSlug,
	serializeBlogMarkdown
} from '$lib/content/blog-source';
import type { PoemFrontmatter } from '$lib/content/poems';
import {
	normalizeHeroImage as normalizePostcardHeroImage,
	serializePostcardMarkdown
} from '$lib/content/postcards';
import type { PostcardFrontmatter, PostcardMeta } from '$lib/content/postcards';
import { createContentSourceChecksum, isValidContentSlug } from '$lib/content/editable-source';
import {
	type TallTaleFrontmatter,
	type TallTaleMeta,
	serializeTallTaleMarkdown
} from '$lib/content/tall-tales';
import {
	createContentRepoCommit,
	decodeGitHubContent,
	getWritingPublishStatus,
	loadGitHubFile,
	PublishError
} from '$lib/server/content-repo';
import { normalizePoemFrontmatter, serializePoemMarkdown } from '$lib/content/poems';

interface SaveBlogPostInput {
	slug: string;
	frontmatter: BlogFrontmatter;
	content: string;
	originalChecksum: string;
}

interface SavePoemInput {
	slug: string;
	frontmatter: PoemFrontmatter;
	content: string;
	originalChecksum: string;
}

interface SavePostcardInput {
	slug: string;
	frontmatter: PostcardFrontmatter;
	content: string;
	originalChecksum: string;
}

interface SaveTallTaleInput {
	slug: string;
	frontmatter: TallTaleFrontmatter;
	content: string;
	originalChecksum: string;
}

export interface SaveBlogPostResult {
	commitSha: string;
	commitUrl: string;
	checksum: string;
	readTime: string;
}

export interface SaveWritingDocumentResult {
	commitSha: string;
	commitUrl: string;
	checksum: string;
}

export interface SaveTimestampedWritingDocumentResult extends SaveWritingDocumentResult {
	lastEditedTime: string;
}

export { PublishError };

export function getBlogPublishStatus() {
	return getWritingPublishStatus();
}

function updatePostsIndex(
	currentPostsJson: string,
	frontmatter: BlogFrontmatter,
	content: string
): string {
	const parsed = JSON.parse(currentPostsJson) as
		| { $schema?: string; data?: BlogPostMeta[] }
		| BlogPostMeta[];
	const posts = Array.isArray(parsed) ? parsed : (parsed.data ?? []);
	const nextPost: BlogPostMeta = {
		id: frontmatter.notionId,
		slug: frontmatter.slug,
		title: frontmatter.title,
		subtitle: frontmatter.subtitle,
		category: frontmatter.category,
		publicationDate: frontmatter.publicationDate,
		formattedPublicationDate: frontmatter.formattedPublicationDate,
		readTime: calculateBlogReadTimeFromContent(content),
		coverImage: frontmatter.coverImage
	};

	const existingIndex = posts.findIndex((post) => post.slug === frontmatter.slug);
	const nextPosts = [...posts];

	if (existingIndex >= 0) {
		nextPosts[existingIndex] = nextPost;
	} else {
		nextPosts.push(nextPost);
	}

	nextPosts.sort((left, right) => right.publicationDate.localeCompare(left.publicationDate));

	if (Array.isArray(parsed)) {
		return `${JSON.stringify(nextPosts, null, 2)}\n`;
	}

	return `${JSON.stringify({ ...parsed, data: nextPosts }, null, 2)}\n`;
}

function updatePostcardsIndex(
	currentMetadataJson: string,
	frontmatter: PostcardFrontmatter
): string {
	const metadata = JSON.parse(currentMetadataJson) as PostcardMeta[];
	const heroImage = normalizePostcardHeroImage(frontmatter.heroImage);
	const nextEntry: PostcardMeta = {
		id: frontmatter.notionId,
		slug: frontmatter.slug,
		title: frontmatter.title,
		description: frontmatter.description,
		lastEditedTime: frontmatter.lastEditedTime,
		...(heroImage ? { heroImage } : {})
	};
	const existingIndex = metadata.findIndex((postcard) => postcard.slug === frontmatter.slug);
	const nextMetadata = [...metadata];

	if (existingIndex >= 0) {
		nextMetadata[existingIndex] = nextEntry;
	} else {
		nextMetadata.unshift(nextEntry);
	}

	return `${JSON.stringify(nextMetadata, null, 2)}\n`;
}

function updateTallTalesIndex(
	currentMetadataJson: string,
	frontmatter: TallTaleFrontmatter
): string {
	const metadata = JSON.parse(currentMetadataJson) as TallTaleMeta[];
	const nextEntry: TallTaleMeta = {
		slug: frontmatter.slug,
		title: frontmatter.title,
		description: frontmatter.description,
		coverImage: frontmatter.heroImage,
		...(frontmatter.audio?.src ? { audio: frontmatter.audio } : {})
	};
	const existingIndex = metadata.findIndex((tale) => tale.slug === frontmatter.slug);
	const nextMetadata = [...metadata];

	if (existingIndex >= 0) {
		nextMetadata[existingIndex] = nextEntry;
	} else {
		nextMetadata.unshift(nextEntry);
	}

	return `${JSON.stringify(nextMetadata, null, 2)}\n`;
}

function validateBlogDocument(input: SaveBlogPostInput): {
	frontmatter: BlogFrontmatter;
	source: string;
} {
	if (!isValidBlogSlug(input.slug)) {
		throw new PublishError('Invalid blog slug.', 400);
	}

	const title = input.frontmatter.title.trim();
	const publicationDate = input.frontmatter.publicationDate.trim();
	const formattedPublicationDate = input.frontmatter.formattedPublicationDate.trim();
	const notionId = input.frontmatter.notionId.trim();
	const body = input.content.trim();

	if (!title || !publicationDate || !formattedPublicationDate || !notionId || !body) {
		throw new PublishError(
			'Title, publication date, formatted publication date, notion ID, and markdown content are required.',
			400
		);
	}

	const frontmatter: BlogFrontmatter = {
		...input.frontmatter,
		title,
		slug: input.slug,
		subtitle: input.frontmatter.subtitle.trim(),
		summary: input.frontmatter.summary.trim(),
		ogDescription: input.frontmatter.ogDescription.trim(),
		category: input.frontmatter.category.trim(),
		publicationDate,
		formattedPublicationDate,
		coverImage: input.frontmatter.coverImage.trim(),
		coverImageCaption: input.frontmatter.coverImageCaption.trim(),
		notionId
	};

	return {
		frontmatter,
		source: serializeBlogMarkdown(frontmatter, body)
	};
}

function validatePoemDocument(input: SavePoemInput): {
	frontmatter: PoemFrontmatter;
	source: string;
} {
	if (!isValidContentSlug(input.slug)) {
		throw new PublishError('Invalid poem slug.', 400);
	}

	const body = input.content.trim();
	const title = input.frontmatter.title.trim();
	const section = input.frontmatter.section.trim();
	const sequence = Math.max(1, Math.trunc(Number(input.frontmatter.sequence) || 1));
	if (!title || !section || !body) {
		throw new PublishError('Title, section, sequence, and poem content are required.', 400);
	}

	const frontmatter = normalizePoemFrontmatter({
		...input.frontmatter,
		title,
		section,
		sequence,
		notionId: input.frontmatter.notionId.trim()
	});

	return {
		frontmatter,
		source: serializePoemMarkdown(frontmatter, body)
	};
}

function validatePostcardDocument(input: SavePostcardInput): {
	frontmatter: PostcardFrontmatter;
	source: string;
} {
	if (!isValidContentSlug(input.slug)) {
		throw new PublishError('Invalid postcard slug.', 400);
	}

	const body = input.content.trim();
	const title = input.frontmatter.title.trim();
	const notionId = input.frontmatter.notionId.trim();
	if (!title || !body || !notionId) {
		throw new PublishError('Title, notion ID, and postcard content are required.', 400);
	}

	const frontmatter: PostcardFrontmatter = {
		...input.frontmatter,
		title,
		slug: input.slug,
		description: input.frontmatter.description.trim(),
		heroImage: input.frontmatter.heroImage.trim(),
		lastEditedTime: new Date().toISOString(),
		notionId
	};

	return {
		frontmatter,
		source: serializePostcardMarkdown(frontmatter, body)
	};
}

function validateTallTaleDocument(input: SaveTallTaleInput): {
	frontmatter: TallTaleFrontmatter;
	source: string;
} {
	if (!isValidContentSlug(input.slug)) {
		throw new PublishError('Invalid tall tale slug.', 400);
	}

	const body = input.content.trim();
	const title = input.frontmatter.title.trim();
	const notionId = input.frontmatter.notionId.trim();
	if (!title || !body || !notionId || input.frontmatter.sections.length === 0) {
		throw new PublishError(
			'Title, notion ID, section metadata, and tall tale content are required.',
			400
		);
	}

	const normalizedSections = input.frontmatter.sections.map((section) => ({
		backgroundImage: section.backgroundImage.trim(),
		textColor: section.textColor.trim() || '#ffffff',
		...(section.backgroundImageOpacity !== undefined &&
		!Number.isNaN(Number(section.backgroundImageOpacity))
			? { backgroundImageOpacity: Number(section.backgroundImageOpacity) }
			: {}),
		...(section.backgroundColor?.trim() ? { backgroundColor: section.backgroundColor.trim() } : {}),
		...(section.overlayColor?.trim() ? { overlayColor: section.overlayColor.trim() } : {}),
		...(section.fontFamily?.trim() ? { fontFamily: section.fontFamily.trim() } : {})
	}));
	const frontmatter: TallTaleFrontmatter = {
		...input.frontmatter,
		title,
		slug: input.slug,
		description: input.frontmatter.description.trim(),
		heroImage: input.frontmatter.heroImage.trim(),
		lastEditedTime: new Date().toISOString(),
		notionId,
		sectionDivider: input.frontmatter.sectionDivider === 'heading' ? 'heading' : 'hr',
		...(input.frontmatter.audio?.src.trim()
			? {
					audio: {
						src: input.frontmatter.audio.src.trim(),
						...(input.frontmatter.audio.loop !== undefined
							? { loop: input.frontmatter.audio.loop }
							: {})
					}
				}
			: {}),
		sections: normalizedSections
	};

	return {
		frontmatter,
		source: serializeTallTaleMarkdown(frontmatter, body)
	};
}

export async function saveBlogPost(input: SaveBlogPostInput): Promise<SaveBlogPostResult> {
	const { frontmatter, source } = validateBlogDocument(input);
	const readTime = calculateBlogReadTimeFromContent(input.content);
	const markdownPath = `blog/${frontmatter.slug}.md`;
	const postsIndexPath = 'blog/posts.json';

	const [remoteMarkdown, remotePosts] = await Promise.all([
		loadGitHubFile(markdownPath),
		loadGitHubFile(postsIndexPath)
	]);

	const remoteMarkdownSource = decodeGitHubContent(remoteMarkdown);
	if (createBlogSourceChecksum(remoteMarkdownSource) !== input.originalChecksum) {
		throw new PublishError(
			'This post changed in the content repo since you opened the editor. Refresh to load the latest version before saving again.',
			409
		);
	}

	const nextPostsJson = updatePostsIndex(
		decodeGitHubContent(remotePosts),
		frontmatter,
		input.content
	);
	const commit = await createContentRepoCommit(
		[
			{ path: markdownPath, content: source },
			{ path: postsIndexPath, content: nextPostsJson }
		],
		`Edit blog post: ${frontmatter.slug}`
	);

	return {
		commitSha: commit.sha,
		commitUrl: commit.html_url,
		checksum: createBlogSourceChecksum(source),
		readTime
	};
}

export async function savePoem(input: SavePoemInput): Promise<SaveWritingDocumentResult> {
	const { source } = validatePoemDocument(input);
	const markdownPath = `poems/${input.slug}.md`;
	const remoteMarkdown = await loadGitHubFile(markdownPath);
	const remoteMarkdownSource = decodeGitHubContent(remoteMarkdown);
	if (createContentSourceChecksum(remoteMarkdownSource) !== input.originalChecksum) {
		throw new PublishError(
			'This poem changed in the content repo since you opened the editor. Refresh to load the latest version before saving again.',
			409
		);
	}

	const commit = await createContentRepoCommit(
		[{ path: markdownPath, content: source }],
		`Edit poem: ${input.slug}`
	);

	return {
		commitSha: commit.sha,
		commitUrl: commit.html_url,
		checksum: createContentSourceChecksum(source)
	};
}

export async function savePostcard(
	input: SavePostcardInput
): Promise<SaveTimestampedWritingDocumentResult> {
	const { frontmatter, source } = validatePostcardDocument(input);
	const markdownPath = `postcards/${input.slug}.md`;
	const metadataPath = 'postcards/metadata.json';
	const [remoteMarkdown, remoteMetadata] = await Promise.all([
		loadGitHubFile(markdownPath),
		loadGitHubFile(metadataPath)
	]);
	const remoteMarkdownSource = decodeGitHubContent(remoteMarkdown);
	if (createContentSourceChecksum(remoteMarkdownSource) !== input.originalChecksum) {
		throw new PublishError(
			'This postcard changed in the content repo since you opened the editor. Refresh to load the latest version before saving again.',
			409
		);
	}

	const nextMetadataJson = updatePostcardsIndex(decodeGitHubContent(remoteMetadata), frontmatter);
	const commit = await createContentRepoCommit(
		[
			{ path: markdownPath, content: source },
			{ path: metadataPath, content: nextMetadataJson }
		],
		`Edit postcard: ${input.slug}`
	);

	return {
		commitSha: commit.sha,
		commitUrl: commit.html_url,
		checksum: createContentSourceChecksum(source),
		lastEditedTime: frontmatter.lastEditedTime
	};
}

export async function saveTallTale(
	input: SaveTallTaleInput
): Promise<SaveTimestampedWritingDocumentResult> {
	const { frontmatter, source } = validateTallTaleDocument(input);
	const markdownPath = `tall-tales/${input.slug}.md`;
	const metadataPath = 'tall-tales/metadata.json';
	const [remoteMarkdown, remoteMetadata] = await Promise.all([
		loadGitHubFile(markdownPath),
		loadGitHubFile(metadataPath)
	]);
	const remoteMarkdownSource = decodeGitHubContent(remoteMarkdown);
	if (createContentSourceChecksum(remoteMarkdownSource) !== input.originalChecksum) {
		throw new PublishError(
			'This tall tale changed in the content repo since you opened the editor. Refresh to load the latest version before saving again.',
			409
		);
	}

	const nextMetadataJson = updateTallTalesIndex(decodeGitHubContent(remoteMetadata), frontmatter);
	const commit = await createContentRepoCommit(
		[
			{ path: markdownPath, content: source },
			{ path: metadataPath, content: nextMetadataJson }
		],
		`Edit tall tale: ${input.slug}`
	);

	return {
		commitSha: commit.sha,
		commitUrl: commit.html_url,
		checksum: createContentSourceChecksum(source),
		lastEditedTime: frontmatter.lastEditedTime
	};
}
