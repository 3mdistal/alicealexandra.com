import { notionClient, withErrorHandling } from './client';
import type {
	QueryDatabaseParameters,
	QueryDatabaseResponse,
	PageObjectResponse
} from '../types/notion-types';
import type { BlogPost, PaginatedResponse } from '../types/notion-types';
import { COMMISSIONS_DB, SUBSCRIBERS_DB, USER_ID_ALICE } from '$env/static/private';

/**
 * Query a Notion database with the provided parameters
 * @param params - Query parameters for the database
 * @returns The query response from Notion
 */
export async function queryDatabase(
	params: QueryDatabaseParameters
): Promise<QueryDatabaseResponse> {
	return withErrorHandling(async () => {
		const response = await notionClient.databases.query(params);
		return response;
	});
}

/**
 * Query a database with pagination support
 * @param databaseId - The ID of the database to query
 * @param filter - Optional filter to apply to the query
 * @param sorts - Optional sorting to apply to the query
 * @param pageSize - Number of results per page (default: 100)
 * @param startCursor - Cursor to start from for pagination
 * @returns Paginated response with results and pagination info
 */
export async function queryDatabasePaginated<T = PageObjectResponse>(
	databaseId: string,
	filter?: QueryDatabaseParameters['filter'],
	sorts?: QueryDatabaseParameters['sorts'],
	pageSize: number = 100,
	startCursor?: string
): Promise<PaginatedResponse<T>> {
	return withErrorHandling(async () => {
		const response = await notionClient.databases.query({
			database_id: databaseId,
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
 * Retrieve a database by its ID
 * @param databaseId - The ID of the database to retrieve
 * @returns The database object
 */
export async function retrieveDatabase(databaseId: string) {
	return withErrorHandling(async () => {
		const response = await notionClient.databases.retrieve({
			database_id: databaseId
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

		return {
			id: page.id,
			slug,
			title,
			description,
			coverImage,
			publishedDate,
			lastEditedTime: page.last_edited_time,
			tags
		};
	});
}
