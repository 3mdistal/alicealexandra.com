import type {
    BlockObjectResponse,
    PartialBlockObjectResponse,
    TextRichTextItemResponse,
    MentionRichTextItemResponse,
    EquationRichTextItemResponse,
    RichTextItemResponse
} from './notion-types';
import type { SupportedBlockType } from './notion-types';

/**
 * Type guard to check if a block is a full BlockObjectResponse
 */
export function isFullBlock(block: BlockObjectResponse | PartialBlockObjectResponse): block is BlockObjectResponse {
    return 'type' in block;
}

/**
 * Type guard to check if a block is of a specific type
 */
export function isBlockType<T extends SupportedBlockType>(
    block: BlockObjectResponse | PartialBlockObjectResponse,
    type: T
): block is BlockObjectResponse & { type: T } {
    return isFullBlock(block) && block.type === type;
}

/**
 * Type guard for paragraph blocks
 */
export function isParagraphBlock(block: BlockObjectResponse | PartialBlockObjectResponse): block is BlockObjectResponse & { type: 'paragraph' } {
    return isBlockType(block, 'paragraph');
}

/**
 * Type guard for heading blocks
 */
export function isHeadingBlock(block: BlockObjectResponse | PartialBlockObjectResponse): block is BlockObjectResponse & {
    type: 'heading_1' | 'heading_2' | 'heading_3'
} {
    return isBlockType(block, 'heading_1') ||
        isBlockType(block, 'heading_2') ||
        isBlockType(block, 'heading_3');
}

/**
 * Type guard for list item blocks
 */
export function isListItemBlock(block: BlockObjectResponse | PartialBlockObjectResponse): block is BlockObjectResponse & {
    type: 'bulleted_list_item' | 'numbered_list_item'
} {
    return isBlockType(block, 'bulleted_list_item') ||
        isBlockType(block, 'numbered_list_item');
}

/**
 * Type guard for image blocks
 */
export function isImageBlock(block: BlockObjectResponse | PartialBlockObjectResponse): block is BlockObjectResponse & { type: 'image' } {
    return isBlockType(block, 'image');
}

/**
 * Type guard for code blocks
 */
export function isCodeBlock(block: BlockObjectResponse | PartialBlockObjectResponse): block is BlockObjectResponse & { type: 'code' } {
    return isBlockType(block, 'code');
}

/**
 * Type guard for text rich text items
 */
export function isTextRichTextItem(item: RichTextItemResponse): item is TextRichTextItemResponse {
    return item.type === 'text';
}

/**
 * Type guard for mention rich text items
 */
export function isMentionRichTextItem(item: RichTextItemResponse): item is MentionRichTextItemResponse {
    return item.type === 'mention';
}

/**
 * Type guard for equation rich text items
 */
export function isEquationRichTextItem(item: RichTextItemResponse): item is EquationRichTextItemResponse {
    return item.type === 'equation';
}

/**
 * Type guard for synced blocks
 */
export function isSyncedBlock(block: BlockObjectResponse | PartialBlockObjectResponse): block is BlockObjectResponse & { type: 'synced_block' } {
    return isBlockType(block, 'synced_block');
}

/**
 * Type guard for table blocks
 */
export function isTableBlock(block: BlockObjectResponse | PartialBlockObjectResponse): block is BlockObjectResponse & { type: 'table' } {
    return isBlockType(block, 'table');
}

/**
 * Type guard for table row blocks
 */
export function isTableRowBlock(block: BlockObjectResponse | PartialBlockObjectResponse): block is BlockObjectResponse & { type: 'table_row' } {
    return isBlockType(block, 'table_row');
} 