import { queryDatabase } from '$lib/notion/api/database';
import { BYPASS_TOKEN, POEMS_SECTIONS_DB, ALL_SCRAPS_DB } from '$env/static/private';
import type { DataSourceQueryParameters } from '$lib/notion/types/notion-types';

const sectionsQueryParams: DataSourceQueryParameters = {
	data_source_id: POEMS_SECTIONS_DB,
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
			property: 'Sequence'
		}
	]
};

const scrapsQueryParams: DataSourceQueryParameters = {
	data_source_id: ALL_SCRAPS_DB,
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
			property: 'Sequence'
		}
	]
};

export async function load() {
	try {
		return {
			props: {
				sections: await queryDatabase(sectionsQueryParams),
				poems: await queryDatabase(scrapsQueryParams)
			}
		};
	} catch (error) {
		console.warn(
			'Failed to load HFC content from Notion:',
			error instanceof Error ? error.message : error
		);
		// Return empty arrays as fallback when Notion is not configured
		return {
			props: {
				sections: { results: [] },
				poems: { results: [] }
			}
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
