import { env } from '$env/dynamic/private';
import type { BlogPostMeta } from '$lib/content/blog';
import {
	calculateBlogReadTimeFromContent,
	createBlogSourceChecksum,
	type BlogFrontmatter,
	isValidBlogSlug,
	serializeBlogMarkdown
} from '$lib/content/blog-source';

interface GitHubContentFile {
	sha: string;
	content: string;
}

interface ContentRepoConfig {
	owner: string;
	repo: string;
	branch: string;
	token: string;
}

interface PublishStatus {
	contentRepoConfigured: boolean;
	deployHookConfigured: boolean;
}

interface SaveBlogPostInput {
	slug: string;
	frontmatter: BlogFrontmatter;
	content: string;
	originalChecksum: string;
}

export interface SaveBlogPostResult {
	commitSha: string;
	commitUrl: string;
	deployTriggered: boolean;
	checksum: string;
	readTime: string;
}

export class PublishError extends Error {
	status: number;

	constructor(message: string, status = 500) {
		super(message);
		this.name = 'PublishError';
		this.status = status;
	}
}

function getContentRepoConfig(): ContentRepoConfig {
	const owner = env['CONTENT_REPO_OWNER']?.trim() || '';
	const repo = env['CONTENT_REPO_NAME']?.trim() || '';
	const branch = env['CONTENT_REPO_BRANCH']?.trim() || 'main';
	const token = env['GITHUB_WRITE_TOKEN']?.trim() || env['GITHUB_TOKEN']?.trim() || '';

	if (!owner || !repo || !token) {
		throw new PublishError(
			'Content publishing is not configured. Set CONTENT_REPO_OWNER, CONTENT_REPO_NAME, and GITHUB_WRITE_TOKEN.',
			500
		);
	}

	return { owner, repo, branch, token };
}

export function getBlogPublishStatus(): PublishStatus {
	return {
		contentRepoConfigured: Boolean(
			env['CONTENT_REPO_OWNER']?.trim() &&
			env['CONTENT_REPO_NAME']?.trim() &&
			(env['GITHUB_WRITE_TOKEN']?.trim() || env['GITHUB_TOKEN']?.trim())
		),
		deployHookConfigured: Boolean(env['VERCEL_DEPLOY_HOOK_URL']?.trim())
	};
}

async function githubRequest<T>(
	config: ContentRepoConfig,
	path: string,
	init?: RequestInit
): Promise<T> {
	const response = await fetch(`https://api.github.com${path}`, {
		...init,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${config.token}`,
			'User-Agent': 'alicealexandra-owner-editor',
			'Content-Type': 'application/json',
			...init?.headers
		}
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new PublishError(
			`GitHub request failed (${response.status}): ${errorText}`,
			response.status
		);
	}

	return (await response.json()) as T;
}

function decodeGitHubContent(file: GitHubContentFile): string {
	return Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf-8');
}

async function loadGitHubFile(
	config: ContentRepoConfig,
	filePath: string
): Promise<GitHubContentFile> {
	const encodedPath = filePath
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/');

	const response = await githubRequest<{ sha: string; content: string }>(
		config,
		`/repos/${config.owner}/${config.repo}/contents/${encodedPath}?ref=${encodeURIComponent(config.branch)}`
	);

	return {
		sha: response.sha,
		content: response.content
	};
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

async function createCommit(
	config: ContentRepoConfig,
	files: Array<{ path: string; content: string }>,
	message: string
) {
	const headRef = await githubRequest<{ object: { sha: string } }>(
		config,
		`/repos/${config.owner}/${config.repo}/git/ref/heads/${encodeURIComponent(config.branch)}`
	);
	const headSha = headRef.object.sha;
	const headCommit = await githubRequest<{ tree: { sha: string } }>(
		config,
		`/repos/${config.owner}/${config.repo}/git/commits/${headSha}`
	);

	const nextTree = await githubRequest<{ sha: string }>(
		config,
		`/repos/${config.owner}/${config.repo}/git/trees`,
		{
			method: 'POST',
			body: JSON.stringify({
				base_tree: headCommit.tree.sha,
				tree: files.map((file) => ({
					path: file.path,
					mode: '100644',
					type: 'blob',
					content: file.content
				}))
			})
		}
	);

	const nextCommit = await githubRequest<{ sha: string; html_url: string }>(
		config,
		`/repos/${config.owner}/${config.repo}/git/commits`,
		{
			method: 'POST',
			body: JSON.stringify({
				message,
				tree: nextTree.sha,
				parents: [headSha]
			})
		}
	);

	await githubRequest(
		config,
		`/repos/${config.owner}/${config.repo}/git/refs/heads/${encodeURIComponent(config.branch)}`,
		{
			method: 'PATCH',
			body: JSON.stringify({
				sha: nextCommit.sha,
				force: false
			})
		}
	);

	return nextCommit;
}

async function triggerVercelDeploy(): Promise<boolean> {
	const deployHookUrl = env['VERCEL_DEPLOY_HOOK_URL']?.trim();
	if (!deployHookUrl) {
		return false;
	}

	const response = await fetch(deployHookUrl, { method: 'POST' });
	if (!response.ok) {
		throw new PublishError(`Vercel deploy hook failed with status ${response.status}.`, 502);
	}

	return true;
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

export async function saveBlogPost(input: SaveBlogPostInput): Promise<SaveBlogPostResult> {
	const config = getContentRepoConfig();
	const { frontmatter, source } = validateBlogDocument(input);
	const readTime = calculateBlogReadTimeFromContent(input.content);
	const markdownPath = `blog/${frontmatter.slug}.md`;
	const postsIndexPath = 'blog/posts.json';

	const [remoteMarkdown, remotePosts] = await Promise.all([
		loadGitHubFile(config, markdownPath),
		loadGitHubFile(config, postsIndexPath)
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
	const commit = await createCommit(
		config,
		[
			{ path: markdownPath, content: source },
			{ path: postsIndexPath, content: nextPostsJson }
		],
		`Edit blog post: ${frontmatter.slug}`
	);

	const deployTriggered = await triggerVercelDeploy();

	return {
		commitSha: commit.sha,
		commitUrl: commit.html_url,
		deployTriggered,
		checksum: createBlogSourceChecksum(source),
		readTime
	};
}
