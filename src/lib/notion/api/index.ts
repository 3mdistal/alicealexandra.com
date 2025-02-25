/**
 * Notion API module
 *
 * This module exports all the functions for interacting with the Notion API.
 */

// Export client utilities
export { notionClient, withErrorHandling, NotionAPIError } from './client';

// Export database operations
export {
	queryDatabase,
	queryDatabasePaginated,
	retrieveDatabase,
	extractBlogPosts
} from './database';

// Export block operations
export {
	retrieveBlock,
	listBlockChildren,
	listAllBlockChildren,
	updateBlock,
	deleteBlock,
	appendBlockChildren
} from './blocks';

// Export page operations
export { retrievePage, createPage, updatePage, addCommission, addSubscriber } from './pages';
