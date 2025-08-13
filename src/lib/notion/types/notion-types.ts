/**
 * Types for Notion API
 * Re-exports from @notionhq/client and custom types
 */

// Re-export types from Notion API
export type {
	BlockObjectResponse,
	ListBlockChildrenResponse,
	QueryDatabaseParameters,
	QueryDatabaseResponse,
	PageObjectResponse,
	PartialBlockObjectResponse,
	RichTextItemResponse,
	TextRichTextItemResponse,
	MentionRichTextItemResponse,
	EquationRichTextItemResponse,
	DatabaseObjectResponse,
	NumberedListItemBlockObjectResponse,
	BulletedListItemBlockObjectResponse,
	TitlePropertyItemObjectResponse,
	RichTextPropertyItemObjectResponse,
	UrlPropertyItemObjectResponse,
	SelectPropertyItemObjectResponse,
	FormulaPropertyItemObjectResponse,
	FilesPropertyItemObjectResponse
} from '@notionhq/client/build/src/api-endpoints';

// Custom types for our application

/**
 * Supported block types for rendering
 */
export type SupportedBlockType =
	| 'paragraph'
	| 'heading_1'
	| 'heading_2'
	| 'heading_3'
	| 'bulleted_list_item'
	| 'numbered_list_item'
	| 'to_do'
	| 'toggle'
	| 'code'
	| 'image'
	| 'quote'
	| 'callout'
	| 'divider'
	| 'bookmark'
	| 'equation'
	| 'table'
	| 'table_row'
	| 'column_list'
	| 'column'
	| 'synced_block';

/**
 * Blog post metadata
 */
export interface BlogPost {
	id: string;
	slug: string;
	title: string;
	description: string;
	coverImage?: string;
	publishedDate: string;
	lastEditedTime: string;
	tags: string[];
}


/**
 * Subscriber data
 */
export interface Subscriber {
	email: string;
}

/**
 * Notion API response with pagination
 */
export interface PaginatedResponse<T> {
	results: T[];
	hasMore: boolean;
	nextCursor: string | null;
}

/**
 * Rich text content with formatting
 */
export interface RichTextContent {
	plainText: string;
	annotations: {
		bold: boolean;
		italic: boolean;
		strikethrough: boolean;
		underline: boolean;
		code: boolean;
		color: string;
	};
	href?: string;
	type: 'text' | 'mention' | 'equation';
}

/**
 * Table of contents entry
 */
export interface TOCEntry {
	id: string;
	text: string;
	level: number;
}
