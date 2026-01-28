import builderPosts from './data/builder-posts.json';

export interface BuilderPost {
	id: string;
	title: string;
	description: string;
	url: string;
	datePublished: string;
}

interface BuilderPostsFile {
	schemaVersion: number;
	generatedFrom: string;
	authorFilter: string;
	data: BuilderPost[];
}

export function loadBuilderPosts(): BuilderPost[] {
	const payload = builderPosts as BuilderPostsFile;
	if (!payload?.data?.length) {
		console.warn('Builder posts dataset is empty. Run `node scripts/scrape-builder-posts.mjs`.');
		return [];
	}
	return payload.data;
}
