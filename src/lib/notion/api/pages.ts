import { notionClient, withErrorHandling } from './client';
import type { PageObjectResponse } from '../types/notion-types';

/**
 * Retrieve a page by its ID
 * @param pageId - The ID of the page to retrieve
 * @returns The page object
 */
export async function retrievePage(pageId: string): Promise<PageObjectResponse> {
	return withErrorHandling(async () => {
		const response = await notionClient.pages.retrieve({
			page_id: pageId
		});
		return response as PageObjectResponse;
	});
}
