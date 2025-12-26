/**
 * Notion module
 *
 * This module provides types and utilities for rendering Notion-style content.
 * Note: API functions have been removed after migration to local content.
 */

// Re-export components (TextMacro for rendering rich text)
export * from './components';

// Re-export types (RichTextItemResponse etc. used by components and content)
export * from './types';

// Re-export utilities (blog helpers)
export * from './utils';
