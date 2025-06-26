import { Client } from '@notionhq/client';
import { NOTION_KEY } from '$env/static/private';

/**
 * Custom error class for Notion API errors
 */
export class NotionAPIError extends Error {
	constructor(
		message: string,
		public originalError?: unknown
	) {
		super(message);
		this.name = 'NotionAPIError';
	}

	toString(): string {
		return `${this.name}: ${this.message}`;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			originalError: this.originalError
		};
	}
}

/**
 * Validates that all required environment variables are present
 * @throws {NotionAPIError} If any required environment variables are missing
 */
export function validateEnvironmentVariables(): void {
	if (!NOTION_KEY) {
		throw new NotionAPIError('Missing required NOTION_KEY environment variable. Please configure your Notion API credentials in the environment variables.');
	}
}

/**
 * The Notion client instance for making API calls
 */
export const notionClient = new Client({
	auth: NOTION_KEY
});

/**
 * Wrapper function to handle Notion API calls with proper error handling
 * @param apiCall - Function that makes the actual API call
 * @returns The result of the API call
 * @throws {NotionAPIError} If the API call fails
 */
export async function withErrorHandling<T>(apiCall: () => Promise<T>): Promise<T> {
	try {
		validateEnvironmentVariables();
		return await apiCall();
	} catch (error) {
		if (error instanceof NotionAPIError) {
			throw error;
		}

		// Handle rate limiting
		if (error instanceof Error && error.message.includes('rate_limited')) {
			throw new NotionAPIError('Notion API rate limit exceeded. Please try again later.', error);
		}

		// Handle authentication errors
		if (error instanceof Error && error.message.includes('unauthorized')) {
			throw new NotionAPIError('Authentication failed with Notion API. Check your API key.', error);
		}

		// Generic error
		throw new NotionAPIError(
			`Failed to execute Notion API call: ${error instanceof Error ? error.message : 'Unknown error'}`,
			error
		);
	}
}
