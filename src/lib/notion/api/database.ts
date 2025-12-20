import { notionClient, withErrorHandling } from './client';
import type {
	QueryDataSourceResponse,
	PageObjectResponse,
	DataSourceQueryParameters
} from '../types/notion-types';
import type { BlogPost, PaginatedResponse } from '../types/notion-types';
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
 * Retrieve a data source by its ID
 * @param dataSourceId - The ID of the data source to retrieve
 * @returns The database object
 */
export async function retrieveDatabase(dataSourceId: string) {
	return withErrorHandling(async () => {
		const response = await notionClient.dataSources.retrieve({
			data_source_id: dataSourceId
		});
		return response;
	});
}

/**
 * Extract blog posts from database query results
 * @param results - The results from a database query
 * @returns Array of blog post objects with extracted metadata
 */
export function extractBlogPosts(results: PageObjectResponse[]): BlogPost[] {
	return results.map((page) => {
		const properties = page.properties;

		// These property names should match your Notion database structure
		const title =
			properties.Title?.type === 'title'
				? properties.Title.title[0]?.plain_text || 'Untitled'
				: 'Untitled';

		const slug =
			properties.Slug?.type === 'rich_text' ? properties.Slug.rich_text[0]?.plain_text || '' : '';

		const description =
			properties.Description?.type === 'rich_text'
				? properties.Description.rich_text[0]?.plain_text || ''
				: '';

		const publishedDate =
			properties['Published Date']?.type === 'date'
				? properties['Published Date'].date?.start || ''
				: '';

		const coverImage =
			properties['Cover Image']?.type === 'url'
				? properties['Cover Image'].url || undefined
				: undefined;

		const tags =
			properties.Tags?.type === 'multi_select'
				? properties.Tags.multi_select.map((tag) => tag.name)
				: [];

		const base = {
			id: page.id,
			slug,
			title,
			description,
			publishedDate,
			lastEditedTime: page.last_edited_time,
			tags
		} satisfies Omit<BlogPost, 'coverImage'>;

		return coverImage ? { ...base, coverImage } : base;
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
		const title =
			properties.Title?.type === 'title'
				? properties.Title.title[0]?.plain_text || 'Untitled'
				: 'Untitled';

		const slug =
			properties.Slug?.type === 'url'
				? properties.Slug.url || ''
				: properties.Slug?.type === 'rich_text'
					? properties.Slug.rich_text[0]?.plain_text || ''
					: '';

		const description =
			properties.Description?.type === 'rich_text'
				? properties.Description.rich_text[0]?.plain_text || ''
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
