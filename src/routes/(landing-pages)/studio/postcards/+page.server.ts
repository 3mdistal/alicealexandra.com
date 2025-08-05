import { queryDatabase, extractPostcards } from '$lib/notion/api/database';
import { BYPASS_TOKEN, POSTCARDS_DB } from '$env/static/private';
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';

const queryParams: QueryDatabaseParameters = {
	database_id: POSTCARDS_DB,
	sorts: [
		{
			direction: 'descending',
			property: 'Title'
		}
	]
};

export async function load() {
	try {
		const response = await queryDatabase(queryParams);
		const postcards = extractPostcards(response.results);
		
		return {
			postcards
		};
	} catch (error) {
		console.warn(
			'Failed to load postcards from Notion:',
			error instanceof Error ? error.message : error
		);
		// Return empty array as fallback when Notion is not configured
		return {
			postcards: []
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
