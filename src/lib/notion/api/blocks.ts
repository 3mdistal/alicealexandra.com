import { notionClient, withErrorHandling } from './client';
import type { BlockObjectResponse, ListBlockChildrenResponse } from '../types/notion-types';
import { isSyncedBlock } from '../types/guards';

/**
 * Retrieve a block by its ID
 * @param blockId - The ID of the block to retrieve
 * @returns The block object
 */
export async function retrieveBlock(blockId: string): Promise<BlockObjectResponse> {
	return withErrorHandling(async () => {
		const response = await notionClient.blocks.retrieve({
			block_id: blockId
		});
		return response as BlockObjectResponse;
	});
}

/**
 * List all children of a block with pagination support
 * @param blockId - The ID of the block whose children to list
 * @param pageSize - Number of results per page (default: 100)
 * @param startCursor - Cursor to start from for pagination
 * @returns The response containing the children blocks
 */
export async function listBlockChildren(
	blockId: string,
	pageSize: number = 100,
	startCursor?: string
): Promise<ListBlockChildrenResponse> {
	return withErrorHandling(async () => {
		const response = await notionClient.blocks.children.list({
			block_id: blockId,
			page_size: pageSize,
			...(startCursor && { start_cursor: startCursor })
		});
		return response;
	});
}

/**
 * List all children of a block recursively, including handling synced blocks
 * @param blockId - The ID of the block whose children to list
 * @param cursor - Cursor for pagination (used internally for recursion)
 * @returns The response containing all children blocks
 */
export async function listAllBlockChildren(
	blockId: string,
	cursor?: string
): Promise<ListBlockChildrenResponse> {
	return withErrorHandling(async () => {
		// Get initial response
		const response = await notionClient.blocks.children.list({
			block_id: blockId,
			...(cursor && { start_cursor: cursor })
		});

		// If there are more children, recursively fetch them
		if (response.has_more && response.next_cursor) {
			const moreResponse = await listAllBlockChildren(blockId, response.next_cursor);
			response.results.push(...moreResponse.results);
		}

		// Process synced blocks
		for (let i = 0; i < response.results.length; i++) {
			const block = response.results[i] as BlockObjectResponse;

			// If this is a synced block, replace it with its original content
			if (isSyncedBlock(block) && block.synced_block.synced_from !== null) {
				const originalBlockId = block.synced_block.synced_from.block_id;
				const originalBlockContent = await listAllBlockChildren(originalBlockId);

				// Replace the synced block with its original content
				response.results.splice(i, 1, ...originalBlockContent.results);

				// Adjust the index to account for the newly inserted blocks
				i += originalBlockContent.results.length - 1;
			}
		}

		return response;
	});
}
