import { queryDatabase } from '$lib/notion/api/database';
import { BYPASS_TOKEN, BLOGS_DB } from '$env/static/private';
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';

const today = new Date(Date.now()).toISOString();

const queryParams: QueryDatabaseParameters = {
	database_id: BLOGS_DB,
	filter: {
		and: [
			{
				property: 'Publication Date',
				date: {
					on_or_before: today
				}
			}
		]
	},
	sorts: [
		{
			direction: 'descending',
			property: 'Publication Date'
		}
	]
};

export async function load() {
	try {
		return {
			post: await queryDatabase(queryParams)
		};
	} catch (error) {
		console.warn('Failed to load blog posts from Notion:', error instanceof Error ? error.message : error);
		// Return empty array as fallback when Notion is not configured
		return {
			post: []
		};
	}
}

export const config = {
	isr: {
		expiration: false,
		bypassToken: BYPASS_TOKEN
	},
	runtime: 'nodejs20.x'
};
