import type { Rule } from 'eslint';
import type { StyleDeclaration, StyleSource, StyleVisitor } from '../style-source.ts';

interface Located {
	loc: { start: { offset: number }; end: { offset: number } };
}

/** The parts of a CSSTree `Declaration` node (from `@eslint/css`) this adapter reads. */
interface CssDeclarationNode {
	property: string;
	value: Partial<Located>;
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
			const { property, value } = node as CssDeclarationNode;
			if (property.startsWith('--')) localDefinitions.add(property);
			if (!value.loc) return;
			const { start, end } = value.loc;
			declarations.push({
				property,
				value: text.slice(start.offset, end.offset),
				valueStart: start.offset
			});
		},
		'StyleSheet:exit'() {
			check({ declarations, localDefinitions });
		}
	};
}
