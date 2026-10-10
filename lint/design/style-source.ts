import type { Rule } from 'eslint';
import { cssStyleVisitor } from './adapters/css.ts';
import { svelteStyleVisitor } from './adapters/svelte.ts';

/** One declaration from a `<style>` block or stylesheet. */
export interface StyleDeclaration {
	property: string;
	value: string;
	/** Where `value` starts in the file's full text. */
	valueStart: number;
}

/**
 * What the design rules need from a file, whichever parser produced it. Each adapter turns its own
 * syntax tree into this shape, so a rule's logic is written once for `.svelte` and `.css` files.
 */
export interface StyleSource {
	declarations: StyleDeclaration[];
	/** Custom properties the file sets for itself, so `var()` can use them without a token. */
	localDefinitions: Set<string>;
}

export type StyleVisitor = Record<string, (node: unknown) => void>;

/** Calls `check` once per file with its styles, or never for files without styles. */
export function visitStyles(
	context: Rule.RuleContext,
	check: (source: StyleSource) => void
): StyleVisitor {
	const { ast, parserServices } = context.sourceCode;
	// `@eslint/css` parses `.css` files into a CSSTree `StyleSheet`, which ESLint's JS types don't know.
	if ((ast.type as string) === 'StyleSheet') return cssStyleVisitor(context, check);
	if (parserServices?.['isSvelte']) return svelteStyleVisitor(context, check);
	return {};
}
