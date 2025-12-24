import { notionClient, withErrorHandling } from './client';
import type {
	QueryDataSourceResponse,
	PageObjectResponse,
	DataSourceQueryParameters
} from '../types/notion-types';
import type { PaginatedResponse } from '../types/notion-types';
// Note: environment constants are imported where needed per-route

/**
 * Query a Notion data source with the provided parameters
 * @param params - Query parameters for the database
 * @returns The query response from Notion
 */
export async function queryDatabase(
	params: DataSourceQueryParameters
): Promise<QueryDataSourceResponse> {
	return withErrorHandling(async () => {
		const response = await notionClient.dataSources.query(params);
		return response;
	});
}

/**
 * Query a data source with pagination support
 * @param dataSourceId - The ID of the data source to query
 * @param filter - Optional filter to apply to the query
 * @param sorts - Optional sorting to apply to the query
 * @param pageSize - Number of results per page (default: 100)
 * @param startCursor - Cursor to start from for pagination
 * @returns Paginated response with results and pagination info
 */
export async function queryDatabasePaginated<T = PageObjectResponse>(
	dataSourceId: string,
	filter?: DataSourceQueryParameters['filter'],
	sorts?: DataSourceQueryParameters['sorts'],
	pageSize: number = 100,
	startCursor?: string
): Promise<PaginatedResponse<T>> {
	return withErrorHandling(async () => {
		const response = await notionClient.dataSources.query({
			data_source_id: dataSourceId,
			...(filter && { filter }),
			...(sorts && { sorts }),
			page_size: pageSize,
			...(startCursor && { start_cursor: startCursor })
		});

		return {
			results: response.results as unknown as T[],
			hasMore: response.has_more,
			nextCursor: response.next_cursor
		};
	});
}

/**
 * Extract postcards from database query results
 * @param results - The results from a database query
 * @returns Array of postcard objects with extracted metadata
 */
export function extractPostcards(results: PageObjectResponse[]): Array<{
	id: string;
	slug: string;
	title: string;
	description: string;
	heroImage?: string;
	lastEditedTime: string;
}> {
	return results.map((page) => {
		const properties = page.properties;

		// Property names should match your Notion database structure
		const titleProp = properties['Title'];
		const title =
			titleProp?.type === 'title'
				? titleProp.title[0]?.plain_text || 'Untitled'
				: 'Untitled';

		const slugProp = properties['Slug'];
		const slug =
			slugProp?.type === 'url'
				? slugProp.url || ''
				: slugProp?.type === 'rich_text'
					? slugProp.rich_text[0]?.plain_text || ''
					: '';

		const descriptionProp = properties['Description'];
		const description =
			descriptionProp?.type === 'rich_text'
				? descriptionProp.rich_text[0]?.plain_text || ''
				: '';

		const heroImage =
			properties['Hero Image']?.type === 'url'
				? properties['Hero Image'].url || undefined
				: undefined;

		const base = {
			id: page.id,
			slug,
			title,
			description,
			lastEditedTime: page.last_edited_time
		} as const;

		return heroImage ? { ...base, heroImage } : base;
	});
}
