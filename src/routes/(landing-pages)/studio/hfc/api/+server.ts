import { loadPoemContent } from '$lib/content/poems';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const { id } = await request.json();

	try {
		const content = await loadPoemContent(id);

		// Parse markdown content into paragraph blocks
		// Split by double newlines to get stanzas
		const stanzas = content.split(/\n\n+/).filter((s) => s.trim());

		// Transform to match the Notion block format the page expects
		const results = stanzas.map((stanza) => ({
			type: 'paragraph',
			paragraph: {
				rich_text: parseMarkdownToRichText(stanza)
			}
		}));

		return json({ results });
	} catch (error) {
		console.error('Failed to load poem content:', error);
		return json({ results: [] }, { status: 404 });
	}
};

/**
 * Parse markdown text to rich_text array format
 * Handles: *italic*, **bold**, `code`, [links](url), ~~strikethrough~~
 */
function parseMarkdownToRichText(text: string) {
	const tokens: Array<{
		type: 'text';
		plain_text: string;
		text: { content: string; link?: { url: string } | null };
		annotations: {
			bold: boolean;
			italic: boolean;
			strikethrough: boolean;
			underline: boolean;
			code: boolean;
		};
		href: string | null;
	}> = [];

	// Regex patterns for markdown syntax
	const patterns = [
		// Links: [text](url)
		{ regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' },
		// Bold: **text**
		{ regex: /\*\*([^*]+)\*\*/g, type: 'bold' },
		// Italic: *text*
		{ regex: /\*([^*]+)\*/g, type: 'italic' },
		// Code: `text`
		{ regex: /`([^`]+)`/g, type: 'code' },
		// Strikethrough: ~~text~~
		{ regex: /~~([^~]+)~~/g, type: 'strikethrough' }
	];

	// Simple approach: if no markdown, return plain text
	const hasMarkdown = patterns.some((p) => p.regex.test(text));

	if (!hasMarkdown) {
		return [
			{
				type: 'text' as const,
				plain_text: text,
				text: { content: text, link: null },
				annotations: {
					bold: false,
					italic: false,
					strikethrough: false,
					underline: false,
					code: false
				},
				href: null
			}
		];
	}

	// For markdown content, do a simple parse
	// This handles the most common case of a single formatting per segment
	let lastIndex = 0;

	// Combined regex for all patterns
	const combinedRegex =
		/(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|~~([^~]+)~~|\[([^\]]+)\]\(([^)]+)\))/g;
	let match;

	while ((match = combinedRegex.exec(text)) !== null) {
		// Add plain text before match
		if (match.index > lastIndex) {
			const plainText = text.slice(lastIndex, match.index);
			tokens.push({
				type: 'text',
				plain_text: plainText,
				text: { content: plainText, link: null },
				annotations: {
					bold: false,
					italic: false,
					strikethrough: false,
					underline: false,
					code: false
				},
				href: null
			});
		}

		const fullMatch = match[0];
		let content = '';
		const annotations = {
			bold: false,
			italic: false,
			strikethrough: false,
			underline: false,
			code: false
		};
		let href: string | null = null;
		let link: { url: string } | null = null;

		if (fullMatch.startsWith('**')) {
			// Bold
			content = match[2];
			annotations.bold = true;
		} else if (fullMatch.startsWith('*')) {
			// Italic
			content = match[3];
			annotations.italic = true;
		} else if (fullMatch.startsWith('`')) {
			// Code
			content = match[4];
			annotations.code = true;
		} else if (fullMatch.startsWith('~~')) {
			// Strikethrough
			content = match[5];
			annotations.strikethrough = true;
		} else if (fullMatch.startsWith('[')) {
			// Link
			content = match[6];
			href = match[7];
			link = { url: match[7] };
		}

		tokens.push({
			type: 'text',
			plain_text: content,
			text: { content, link },
			annotations,
			href
		});

		lastIndex = match.index + fullMatch.length;
	}

	// Add remaining text after last match
	if (lastIndex < text.length) {
		const plainText = text.slice(lastIndex);
		tokens.push({
			type: 'text',
			plain_text: plainText,
			text: { content: plainText, link: null },
			annotations: {
				bold: false,
				italic: false,
				strikethrough: false,
				underline: false,
				code: false
			},
			href: null
		});
	}

	return tokens.length > 0
		? tokens
		: [
				{
					type: 'text' as const,
					plain_text: text,
					text: { content: text, link: null },
					annotations: {
						bold: false,
						italic: false,
						strikethrough: false,
						underline: false,
						code: false
					},
					href: null
				}
			];
}
