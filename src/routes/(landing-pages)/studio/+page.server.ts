import { queryDatabase } from '$lib/notion/api/database';
import { BYPASS_TOKEN, STUDIO_DB } from '$env/static/private';
import type { DataSourceQueryParameters } from '$lib/notion/types/notion-types';

const queryParameters: DataSourceQueryParameters = {
	data_source_id: STUDIO_DB,
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
		// Return empty array as fallback when Notion is not configured
		return {
			cards: { results: [] }
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
