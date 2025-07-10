import { queryDatabase } from '$lib/notion/api/database';
import { BYPASS_TOKEN, PROFESSIONAL_DB } from '$env/static/private';
import type {
	QueryDatabaseParameters,
	TextRichTextItemResponse
} from '$lib/notion/types/notion-types';

const queryParams: QueryDatabaseParameters = {
	database_id: PROFESSIONAL_DB,
	sorts: [
		{
			direction: 'descending',
			property: 'Date'
		}
	]
};

export async function load() {
	try {
		return {
			publicationList: await queryDatabase(queryParams)
		};
	} catch (error) {
		console.warn(
			'Failed to load publications from Notion:',
			error instanceof Error ? error.message : error
		);
		// Return empty array as fallback when Notion is not configured
		return {
			publicationList: { results: [] }
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
			rich_text: TextRichTextItemResponse[];
		};
	};
};
