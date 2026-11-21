/** The reading speed the estimate assumes, a common figure for adults reading on a screen. */
const READING_SPEED_WORDS_PER_MINUTE = 225;

/**
 * A post's reading time as its header shows it, such as "12 min read", never less than a minute.
 *
 * The server and the post editor's live preview both call this, so it can't import anything
 * server-only.
 */
export function calculateBlogReadTimeFromContent(content: string): string {
	const wordCount = content.match(/\b[\w'-]+\b/g)?.length ?? 0;
	const minutes = Math.max(1, Math.ceil(wordCount / READING_SPEED_WORDS_PER_MINUTE));
	return `${minutes} min read`;
}
