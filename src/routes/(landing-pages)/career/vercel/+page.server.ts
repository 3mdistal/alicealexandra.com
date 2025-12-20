import { queryDatabase } from '$lib/notion/api/database';
import { env } from '$env/dynamic/private';
import type { DataSourceQueryParameters, TextRichTextItem } from '$lib/notion/types/notion-types';

const bypassToken = env.BYPASS_TOKEN;
const professionalDb = env.PROFESSIONAL_DB;

export async function load() {
	if (!professionalDb) {
		// Return empty array as fallback when Notion is not configured
		return {
			publicationList: { results: [] }
		};
	}

	const queryParams: DataSourceQueryParameters = {
		data_source_id: professionalDb,
		sorts: [
			{
				direction: 'descending',
				property: 'Date'
			}
		]
	};

	try {
		return {
			publicationList: await queryDatabase(queryParams)
		};
	} catch (error) {
		// Return empty array as fallback when Notion is not configured
		return {
			publicationList: { results: [] }
		};
	}
}

export const config = {
	...(bypassToken ? { isr: { expiration: false, bypassToken } } : {}),
	runtime: 'nodejs20.x'
};

export type ProfessionalPublications = {
	id: string;
	properties: {
		Name: {
			type: 'title';
			title: [
				{
					plain_text: string;
				}
			];
		};
		Date: {
			type: 'date';
			date: {
				start: string;
			};
		};
		Type: {
			type: 'select';
			select: {
				name: string;
			};
		};
		Link: {
			type: 'url';
			url: string;
		};
		Description: {
			type: 'rich_text';
			rich_text: TextRichTextItem[];
		};
	};
};
