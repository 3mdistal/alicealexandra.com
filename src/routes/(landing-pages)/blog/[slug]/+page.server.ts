import { queryDatabase } from '$lib/notion/api/database';
import { listChildren } from '$lib/notion/api/blocks';
import type { QueryDatabaseParameters } from '$lib/notion/types/notion-types';
import { BYPASS_TOKEN, BLOGS_DB } from '$env/static/private';

export async function load({ params }: { params: { slug: string } }) {
	async function fetchContent(slug: string) {
		try {
			const queryParams: QueryDatabaseParameters = {
				database_id: BLOGS_DB,
				filter: {
					and: [
						{
							property: 'Slug',
							url: {
								equals: slug
							}
						}
					]
				}
			};

			// Query blogs database for blog with matching slug.
			const queryResponse = await queryDatabase(queryParams);

			if (queryResponse.results.length === 0) {
				return { queryResponse: null, contentResponse: null };
			}

			// Get the content of the blog post.
			const contentResponse = await listChildren(queryResponse.results[0].id);

			return { queryResponse, contentResponse };
		} catch (error) {
			console.warn('Failed to load blog post from Notion:', error instanceof Error ? error.message : error);
			return { queryResponse: null, contentResponse: null };
		}
	}

	const result = await fetchContent(params['slug'] as string);
	return {
		post: result
	};
}

export const config = {
	isr: {
		expiration: false,
		bypassToken: BYPASS_TOKEN
	},
	runtime: 'nodejs20.x'
};
