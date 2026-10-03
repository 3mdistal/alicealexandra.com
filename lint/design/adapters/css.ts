import type { Rule } from 'eslint';
import type { StyleDeclaration, StyleSource, StyleVisitor } from '../style-source.ts';

/** The parts of a CSSTree `Declaration` node (from `@eslint/css`) this adapter reads. */
interface CssDeclarationNode {
	property: string;
	loc: { start: { offset: number }; end: { offset: number } };
}

/** Reads declarations from a `.css` file parsed by `@eslint/css`. */
export function cssStyleVisitor(
	context: Rule.RuleContext,
	check: (source: StyleSource) => void
): StyleVisitor {
	const { text } = context.sourceCode;
	const declarations: StyleDeclaration[] = [];
	const localDefinitions = new Set<string>();

	return {
		Declaration(node) {
			const { property, loc } = node as CssDeclarationNode;
			const source = text.slice(loc.start.offset, loc.end.offset);
			const colon = source.indexOf(':');
			if (colon === -1) return;
			if (property.startsWith('--')) localDefinitions.add(property);
			declarations.push({
				property,
				value: source.slice(colon + 1),
				valueStart: loc.start.offset + colon + 1
			});
		},
		'StyleSheet:exit'() {
			check({ declarations, localDefinitions });
		}
	};
}
