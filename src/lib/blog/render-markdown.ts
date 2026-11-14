import { Marked, type TokenizerAndRendererExtension } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import plaintext from 'highlight.js/lib/languages/plaintext';

let languagesRegistered = false;

const INTERLUDE_VIDEO = /^\s*<video\b[^>]*\bclass="[^"]*\bsession-interlude-video\b/;

const TOGGLE_ICONS = {
	play: '<path d="M8 5V19L19 12L8 5Z" fill="currentColor" />',
	pause:
		'<rect x="6" y="4" width="4" height="16" fill="currentColor" /><rect x="14" y="4" width="4" height="16" fill="currentColor" />'
};

/** The icon for an interlude video's button: pause while it plays, play while it's paused. */
export function interludeToggleIcon(playing: boolean): string {
	const icon = playing ? TOGGLE_ICONS.pause : TOGGLE_ICONS.play;
	return `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">${icon}</svg>`;
}

const SCRIPT_MARKER = /^\{(super|sub):([^}]*)\}/;

/** Posts write superscript and subscript as `{super:TM}` and `{sub:2}`. */
const scriptMarkers: TokenizerAndRendererExtension = {
	name: 'scriptMarker',
	level: 'inline',
	start(src) {
		return src.match(/\{(?:super|sub):/)?.index;
	},
	tokenizer(src) {
		const match = SCRIPT_MARKER.exec(src);

		if (!match) {
			return undefined;
		}

		return {
			type: 'scriptMarker',
			raw: match[0],
			tag: match[1] === 'super' ? 'sup' : 'sub',
			tokens: this.lexer.inlineTokens(match[2] ?? '')
		};
	},
	renderer(token) {
		const tag = token['tag'] === 'sup' ? 'sup' : 'sub';
		return `<${tag}>${this.parser.parseInline(token.tokens ?? [])}</${tag}>`;
	}
};

const ESCAPED: Record<string, string> = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'"
};

/** A heading's ID from its rendered HTML: its words, lowercased and hyphenated ("Session 1" → "session-1"). */
export function headingSlug(html: string): string {
	return html
		.replace(/<[^>]*>/g, '')
		.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => ESCAPED[entity] ?? entity)
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** `base`, or `base-2`, `base-3`… when an earlier heading in the post already took it. */
function claimId(base: string, taken: Set<string>): string {
	let id = base;

	for (let n = 2; taken.has(id); n++) {
		id = `${base}-${n}`;
	}

	taken.add(id);
	return id;
}

export interface BlogMarkdownOptions {
	/**
	 * Frame each interlude video with a play/pause button, hidden until the page's script wires it
	 * up (see interlude-videos.ts). Feeds leave it off, since they can't run that script.
	 */
	interludeVideoControls?: boolean;
}

function ensureHighlightLanguages() {
	if (languagesRegistered) {
		return;
	}

	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('plaintext', plaintext);
	languagesRegistered = true;
}

function createRenderer({ interludeVideoControls = false }: BlogMarkdownOptions) {
	ensureHighlightLanguages();

	const marked = new Marked(
		markedHighlight({
			emptyLangClass: 'hljs',
			langPrefix: 'hljs language-',
			highlight(code, lang) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			}
		})
	);

	// A renderer serves one post, so its headings share one set of IDs.
	const headingIds = new Set<string>();

	marked.use({
		extensions: [scriptMarkers],
		renderer: {
			heading({ tokens, depth }) {
				const html = this.parser.parseInline(tokens);
				const id = claimId(headingSlug(html) || 'section', headingIds);
				return `<h${depth} id="${id}">${html}</h${depth}>\n`;
			}
		}
	});

	if (interludeVideoControls) {
		marked.use({
			renderer: {
				html({ text, block }) {
					if (!block || !INTERLUDE_VIDEO.test(text)) {
						return false;
					}

					const toggle = `<button type="button" class="session-interlude-toggle" aria-label="Play video" hidden>${interludeToggleIcon(false)}</button>`;
					return `<div class="session-interlude">${text.trim()}${toggle}</div>\n`;
				}
			}
		});
	}

	return marked;
}

export function renderBlogMarkdown(markdown: string, options: BlogMarkdownOptions = {}): string {
	return createRenderer(options).parse(markdown) as string;
}
