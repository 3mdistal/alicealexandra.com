import { notionClient, withErrorHandling } from './client';
import { COMMISSIONS_DB, SUBSCRIBERS_DB, USER_ID_ALICE } from '$env/static/private';
import type { PageObjectResponse } from '../types/notion-types';
import type { CommissionRequest, Subscriber } from '../types/notion-types';

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

/**
 * Create a new page in a database
 * @param databaseId - The ID of the database to create the page in
 * @param properties - The properties of the page to create
 * @returns The created page
 */
export async function createPage(
	databaseId: string,
	properties: Record<string, any>
): Promise<PageObjectResponse> {
	return withErrorHandling(async () => {
		const response = await notionClient.pages.create({
			parent: { database_id: databaseId },
			properties
		});
		return response as PageObjectResponse;
	});
}

/**
 * Update a page's properties
 * @param pageId - The ID of the page to update
 * @param properties - The properties to update
 * @returns The updated page
 */
export async function updatePage(
	pageId: string,
	properties: Record<string, any>
): Promise<PageObjectResponse> {
	return withErrorHandling(async () => {
		const response = await notionClient.pages.update({
			page_id: pageId,
			properties
		});
		return response as PageObjectResponse;
	});
}

/**
 * Add a commission to the commissions database
 * @param commission - The commission request data
 * @returns The created page
 */
export async function addCommission(commission: CommissionRequest): Promise<PageObjectResponse> {
	return withErrorHandling(async () => {
		if (!COMMISSIONS_DB || !USER_ID_ALICE) {
			throw new Error('Missing required environment variables for commissions');
		}

		const { name, email, description } = commission;

		const response = await notionClient.pages.create({
			parent: { database_id: COMMISSIONS_DB },
			properties: {
				title: {
					title: [
						{
							text: {
								content: name
							}
						}
					]
				},
				Email: {
					email: email
				},
				Description: {
					rich_text: [
						{
							text: {
								content: description
							}
						}
					]
				},
				Notify: {
					people: [
						{
							id: USER_ID_ALICE
						}
					]
				}
			}
		});

		return response as PageObjectResponse;
	});
}

/**
 * Add a subscriber to the subscribers database
 * @param subscriber - The subscriber data
 * @returns The created page
 */
export async function addSubscriber(subscriber: Subscriber): Promise<PageObjectResponse> {
	return withErrorHandling(async () => {
		if (!SUBSCRIBERS_DB) {
			throw new Error('Missing required environment variables for subscribers');
		}

		const { email } = subscriber;

		const response = await notionClient.pages.create({
			parent: {
				database_id: SUBSCRIBERS_DB
			},
			properties: {
				Email: {
					email: email
				}
			}
		});

		return response as PageObjectResponse;
	});
}
