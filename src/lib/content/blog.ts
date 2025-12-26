import * as fs from 'fs/promises';
import * as path from 'path';

const CONTENT_PATH = path.join(process.cwd(), 'content', 'blog');

export interface BlogPostMeta {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	category: string;
	publicationDate: string;
	formattedPublicationDate: string;
	readTime: string;
	coverImage: string;
}

export interface BlogPost extends BlogPostMeta {
	summary: string;
	ogDescription: string;
	coverImageCaption: string;
	notionId: string;
	content: string;
}

interface BlogFrontmatter {
	title: string;
	slug: string;
	subtitle: string;
	summary: string;
	ogDescription: string;
	category: string;
	publicationDate: string;
	formattedPublicationDate: string;
	readTime: string;
	coverImage: string;
	coverImageCaption: string;
	notionId: string;
}

function parseFrontmatter(content: string): { frontmatter: BlogFrontmatter; body: string } {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
	const match = content.match(frontmatterRegex);

	if (!match || !match[1]) {
		throw new Error('No frontmatter found in markdown file');
	}

	const frontmatterStr: string = match[1];
	const body = content.slice(match[0].length);

	const frontmatter: Record<string, any> = {};
	for (const line of frontmatterStr.split('\n')) {
		const colonIndex = line.indexOf(':');
		if (colonIndex > 0) {
			const key = line.slice(0, colonIndex).trim();
			let value: any = line.slice(colonIndex + 1).trim();

			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
			} else if (value === 'true') value = true;
			else if (value === 'false') value = false;

			frontmatter[key] = value;
		}
	}

	return {
		frontmatter: frontmatter as BlogFrontmatter,
		body: body.trim()
	};
}

export async function loadPostsMeta(): Promise<BlogPostMeta[]> {
	const postsPath = path.join(CONTENT_PATH, 'posts.json');
	const content = await fs.readFile(postsPath, 'utf-8');
	const parsed = JSON.parse(content);
	return Array.isArray(parsed) ? parsed : parsed.data;
}

export async function loadPostBySlug(slug: string): Promise<BlogPost | null> {
	try {
		const filePath = path.join(CONTENT_PATH, `${slug}.md`);
		const fileContent = await fs.readFile(filePath, 'utf-8');
		const { frontmatter, body } = parseFrontmatter(fileContent);

		return {
			id: frontmatter.notionId,
			slug: frontmatter.slug,
			title: frontmatter.title,
			subtitle: frontmatter.subtitle,
			summary: frontmatter.summary,
			ogDescription: frontmatter.ogDescription,
			category: frontmatter.category,
			publicationDate: frontmatter.publicationDate,
			formattedPublicationDate: frontmatter.formattedPublicationDate,
			readTime: frontmatter.readTime,
			coverImage: frontmatter.coverImage,
			coverImageCaption: frontmatter.coverImageCaption,
			notionId: frontmatter.notionId,
			content: body
		};
	} catch {
		return null;
	}
}

export async function loadAllPosts(): Promise<BlogPost[]> {
	const files = await fs.readdir(CONTENT_PATH);
	const mdFiles = files.filter((f) => f.endsWith('.md'));

	const posts: BlogPost[] = [];

	for (const file of mdFiles) {
		const filePath = path.join(CONTENT_PATH, file);
		const fileContent = await fs.readFile(filePath, 'utf-8');
		const { frontmatter, body } = parseFrontmatter(fileContent);

		posts.push({
			id: frontmatter.notionId,
			slug: frontmatter.slug,
			title: frontmatter.title,
			subtitle: frontmatter.subtitle,
			summary: frontmatter.summary,
			ogDescription: frontmatter.ogDescription,
			category: frontmatter.category,
			publicationDate: frontmatter.publicationDate,
			formattedPublicationDate: frontmatter.formattedPublicationDate,
			readTime: frontmatter.readTime,
			coverImage: frontmatter.coverImage,
			coverImageCaption: frontmatter.coverImageCaption,
			notionId: frontmatter.notionId,
			content: body
		});
	}

	return posts.sort(
		(a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
	);
}

export function transformPostsToNotionFormat(posts: BlogPostMeta[]) {
	return {
		results: posts.map((post) => ({
			id: post.id,
			cover: post.coverImage
				? {
						type: 'external' as const,
						external: { url: post.coverImage }
					}
				: null,
			properties: {
				Name: {
					type: 'title' as const,
					title: [
						{
							type: 'text' as const,
							plain_text: post.title,
							text: { content: post.title, link: null }
						}
					]
				},
				Slug: {
					type: 'url' as const,
					url: post.slug
				},
				Subtitle: {
					type: 'rich_text' as const,
					rich_text: [
						{
							type: 'text' as const,
							plain_text: post.subtitle,
							text: { content: post.subtitle, link: null }
						}
					]
				},
				Category: {
					type: 'select' as const,
					select: { name: post.category }
				},
				FormattedPublicationDate: {
					type: 'formula' as const,
					formula: { type: 'string' as const, string: post.formattedPublicationDate }
				},
				ReadTime: {
					type: 'formula' as const,
					formula: { type: 'string' as const, string: post.readTime }
				}
			}
		}))
	};
}

export function transformPostToNotionFormat(post: BlogPost) {
	return {
		queryResponse: {
			results: [
				{
					id: post.id,
					cover: post.coverImage
						? {
								type: 'external' as const,
								external: { url: post.coverImage }
							}
						: null,
					properties: {
						Name: {
							type: 'title' as const,
							title: [
								{
									type: 'text' as const,
									plain_text: post.title,
									text: { content: post.title, link: null }
								}
							]
						},
						Slug: {
							type: 'url' as const,
							url: post.slug
						},
						Subtitle: {
							type: 'rich_text' as const,
							rich_text: [
								{
									type: 'text' as const,
									plain_text: post.subtitle,
									text: { content: post.subtitle, link: null }
								}
							]
						},
						Summary: {
							type: 'rich_text' as const,
							rich_text: [
								{
									type: 'text' as const,
									plain_text: post.summary,
									text: { content: post.summary, link: null }
								}
							]
						},
						OGDescription: {
							type: 'rich_text' as const,
							rich_text: [
								{
									type: 'text' as const,
									plain_text: post.ogDescription,
									text: { content: post.ogDescription, link: null }
								}
							]
						},
						Category: {
							type: 'select' as const,
							select: { name: post.category }
						},
						'Publication Date': {
							type: 'formula' as const,
							formula: { type: 'string' as const, string: post.formattedPublicationDate }
						},
						ReadTime: {
							type: 'formula' as const,
							formula: { type: 'string' as const, string: post.readTime }
						}
					}
				}
			]
		},
		contentResponse: {
			results: [],
			markdownContent: post.content
		}
	};
}
