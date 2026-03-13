import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import plaintext from 'highlight.js/lib/languages/plaintext';

let languagesRegistered = false;

function ensureHighlightLanguages() {
	if (languagesRegistered) {
		return;
	}

	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('plaintext', plaintext);
	languagesRegistered = true;
}

function createRenderer() {
	ensureHighlightLanguages();

	return new Marked(
		markedHighlight({
			emptyLangClass: 'hljs',
			langPrefix: 'hljs language-',
			highlight(code, lang) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			}
		})
	);
}

export function renderBlogMarkdown(markdown: string): string {
	return createRenderer().parse(markdown) as string;
}
