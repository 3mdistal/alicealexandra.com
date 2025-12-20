import { queryDatabase } from '$lib/notion/api/database';
import { env } from '$env/dynamic/private';
import type { DataSourceQueryParameters } from '$lib/notion/types/notion-types';

const bypassToken = env.BYPASS_TOKEN;
const illustrationsDb = env.ILLUSTRATIONS_DB;

export async function load() {
	if (!illustrationsDb) {
		// Return empty array as fallback when Notion is not configured
		return {
			illustrations: { results: [] }
		};
	}

	const queryParams: DataSourceQueryParameters = {
		data_source_id: illustrationsDb,
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

	try {
		return {
			illustrations: await queryDatabase(queryParams)
		};
	} catch (error) {
		// Return empty array as fallback when Notion is not configured
		return {
			illustrations: { results: [] }
		};
	}
}

export const config = {
	...(bypassToken ? { isr: { expiration: false, bypassToken } } : {}),
	runtime: 'nodejs20.x'
};
