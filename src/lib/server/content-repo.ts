import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export interface GitHubContentFile {
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

export function getWritingPublishStatus(): PublishStatus {
	return {
		contentRepoConfigured: Boolean(
			env['CONTENT_REPO_OWNER']?.trim() &&
			env['CONTENT_REPO_NAME']?.trim() &&
			(env['GITHUB_WRITE_TOKEN']?.trim() || env['GITHUB_TOKEN']?.trim())
		)
	};
}

export function getBlogPublishStatus(): PublishStatus {
	return getWritingPublishStatus();
}

async function githubRequest<T>(
	config: ContentRepoConfig,
	requestPath: string,
	init?: RequestInit
): Promise<T> {
	const response = await fetch(`https://api.github.com${requestPath}`, {
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

export function decodeGitHubContent(file: GitHubContentFile): string {
	return Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf-8');
}

export async function loadGitHubFile(filePath: string): Promise<GitHubContentFile> {
	const config = getContentRepoConfig();
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

async function loadLocalContentTextFile(filePath: string): Promise<string | null> {
	const localFilePath = path.join(process.cwd(), 'content', filePath);

	try {
		return await fs.readFile(localFilePath, 'utf-8');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return null;
		}

		throw error;
	}
}

async function loadGitHubContentTextFile(filePath: string): Promise<string | null> {
	try {
		const githubFile = await loadGitHubFile(filePath);
		return decodeGitHubContent(githubFile);
	} catch (error) {
		if (error instanceof PublishError) {
			if (error.status === 404 || error.status === 409) {
				return null;
			}

			if (
				error.message.includes('Content publishing is not configured') ||
				error.status === 401 ||
				error.status === 403
			) {
				return null;
			}
		}

		throw error;
	}
}

export async function loadPreferredContentTextFile(
	filePath: string
): Promise<{ content: string; source: 'local' | 'github' } | null> {
	const sourceLoaders = dev
		? [
				async () => {
					const content = await loadLocalContentTextFile(filePath);
					return content ? { content, source: 'local' as const } : null;
				},
				async () => {
					const content = await loadGitHubContentTextFile(filePath);
					return content ? { content, source: 'github' as const } : null;
				}
			]
		: [
				async () => {
					const content = await loadGitHubContentTextFile(filePath);
					return content ? { content, source: 'github' as const } : null;
				},
				async () => {
					const content = await loadLocalContentTextFile(filePath);
					return content ? { content, source: 'local' as const } : null;
				}
			];

	for (const loadSource of sourceLoaders) {
		const result = await loadSource();
		if (result) {
			return result;
		}
	}

	return null;
}

export async function createContentRepoCommit(
	files: Array<{ path: string; content: string }>,
	message: string
) {
	const config = getContentRepoConfig();
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
