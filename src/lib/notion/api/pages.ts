import { notionClient, withErrorHandling } from './client';
import { TECHNOTES_DB, SUBSCRIBERS_DB, USER_ID_ALICE } from '$env/static/private';
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

// Alias for createPage to maintain backward compatibility
export const createDatabaseItem = createPage;

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
 * Add a technote to the technotes database
 * @param technoteOrName - Either a TechnoteRequest object or the name of the requester
 * @param email - The email of the requester (when using the string signature)
 * @param description - The description of the technote (when using the string signature)
 * @returns The created page
 */
export async function addTechnote(
	technoteOrName: TechnoteRequest | string,
	email?: string,
	description?: string
): Promise<PageObjectResponse> {
	return withErrorHandling(async () => {
		if (!TECHNOTES_DB || !USER_ID_ALICE) {
			throw new Error('Missing required environment variables for technotes');
		}

		let name: string;
		let emailValue: string;
		let descriptionValue: string;

		// Handle both function signatures
		if (typeof technoteOrName === 'string') {
			// Legacy signature with separate parameters
			name = technoteOrName;
			emailValue = email || '';
			descriptionValue = description || '';
		} else {
			// Object signature
			name = technoteOrName.name;
			emailValue = technoteOrName.email;
			descriptionValue = technoteOrName.description;
		}

		const response = await notionClient.pages.create({
			parent: { database_id: TECHNOTES_DB },
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
					email: emailValue
				},
				Description: {
					rich_text: [
						{
							text: {
								content: descriptionValue
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
 * @param subscriberOrEmail - Either a Subscriber object or an email string
 * @returns The created page
 */
export async function addSubscriber(
	subscriberOrEmail: Subscriber | string
): Promise<PageObjectResponse> {
	return withErrorHandling(async () => {
		if (!SUBSCRIBERS_DB) {
			throw new Error('Missing required environment variables for subscribers');
		}

		let emailValue: string;

		// Handle both function signatures
		if (typeof subscriberOrEmail === 'string') {
			// Legacy signature with just the email
			emailValue = subscriberOrEmail;
		} else {
			// Object signature
			emailValue = subscriberOrEmail.email;
		}

		const response = await notionClient.pages.create({
			parent: {
				database_id: SUBSCRIBERS_DB
			},
			properties: {
				Email: {
					email: emailValue
				}
			}
		});

		return response as PageObjectResponse;
	});
}
