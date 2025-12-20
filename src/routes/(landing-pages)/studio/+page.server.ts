import { queryDatabase } from '$lib/notion/api/database';
import { env } from '$env/dynamic/private';
import type { DataSourceQueryParameters } from '$lib/notion/types/notion-types';

const bypassToken = env.BYPASS_TOKEN;
const studioDb = env.STUDIO_DB;

export async function load() {
	if (!studioDb) {
		// Return empty array as fallback when Notion is not configured
		return {
			cards: { results: [] }
		};
	}

	const queryParameters: DataSourceQueryParameters = {
		data_source_id: studioDb,
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
	...(bypassToken ? { isr: { expiration: false, bypassToken } } : {}),
	runtime: 'nodejs20.x'
};
