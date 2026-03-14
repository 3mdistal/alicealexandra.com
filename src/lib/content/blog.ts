import * as fs from 'fs/promises';
import * as path from 'path';
import { calculateBlogReadTimeFromContent, parseBlogMarkdown } from '$lib/content/blog-source';

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
		const { frontmatter, body } = parseBlogMarkdown(fileContent);

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
			readTime: calculateBlogReadTimeFromContent(body),
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
		const { frontmatter, body } = parseBlogMarkdown(fileContent);

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
			readTime: calculateBlogReadTimeFromContent(body),
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
