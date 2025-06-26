import { queryDatabase } from '$lib/notion/api/database';
import { BYPASS_TOKEN, STUDIO_DB } from '$env/static/private';
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';

const queryParameters: QueryDatabaseParameters = {
	database_id: STUDIO_DB,
	filter: {
		and: [
			{
				property: 'Published',
				checkbox: {
					equals: true
				}
			}
		]
	},
	sorts: [
		{
			direction: 'ascending',
			property: 'Order'
		}
	]
};

export async function load() {
	try {
		return {
			cards: await queryDatabase(queryParameters)
		};
	} catch (error) {
		console.warn('Failed to load studio cards from Notion:', error instanceof Error ? error.message : error);
		// Return empty array as fallback when Notion is not configured
		return {
			cards: []
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
