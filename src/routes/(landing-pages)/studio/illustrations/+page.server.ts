import { queryDatabase } from '$lib/notion/api/database';
import { BYPASS_TOKEN, ILLUSTRATIONS_DB } from '$env/static/private';
import type { DataSourceQueryParameters } from '$lib/notion/types/notion-types';

const queryParams: DataSourceQueryParameters = {
	data_source_id: ILLUSTRATIONS_DB,
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
			illustrations: await queryDatabase(queryParams)
		};
	} catch (error) {
		console.warn(
			'Failed to load illustrations from Notion:',
			error instanceof Error ? error.message : error
		);
		// Return empty array as fallback when Notion is not configured
		return {
			illustrations: { results: [] }
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
